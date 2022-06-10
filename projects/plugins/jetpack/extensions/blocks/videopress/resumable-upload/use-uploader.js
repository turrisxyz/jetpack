import * as tus from 'tus-js-client';

export const getJWT = function ( key ) {
	return new Promise( function ( resolve, reject ) {
		const extras = key ? { data: { key } } : {};
		// eslint-disable-next-line no-undef
		wp.media
			.ajax( 'videopress-get-upload-jwt', { async: true, ...extras } )
			.done( function ( response ) {
				resolve( {
					token: response.upload_token,
					blogId: response.upload_blog_id,
					url: response.upload_action_url,
				} );
			} )
			.fail( function ( reason ) {
				reject( reason );
			} );
	} );
};

const jwtsForKeys = {};

export const resumableUploader = ( { onError, onProgress, onSuccess } ) => {
	const GUID_HEADER = 'x-videopress-upload-guid';
	const MEDIA_ID_HEADER = 'x-videopress-upload-media-id';
	const SRC_URL_HEADER = 'x-videopress-upload-src-url';

	const extractUploadKeyForUrl = urlString => {
		const url = new URL( urlString );
		const path = url.pathname;
		const parts = path.split( '/' );
		return parts[ parts.length - 1 ];
	};

	const getJwtForKey = ( maybeUploadkey, method ) => {
		return new Promise( ( resolve, reject ) => {
			if ( jwtsForKeys[ maybeUploadkey ] ) {
				resolve( jwtsForKeys[ maybeUploadkey ] );
			} else if ( 'HEAD' === method ) {
				getJWT( maybeUploadkey )
					.then( responseData => {
						jwtsForKeys[ maybeUploadkey ] = responseData.token;
						resolve( jwtsForKeys[ maybeUploadkey ] );
					} )
					.catch( reject );
			} else {
				reject( 'No jwt present' );
			}
		} );
	};

	const extractHeadersFromXhr = res => {
		const guid = res.getHeader( GUID_HEADER );
		const mediaId = res.getHeader( MEDIA_ID_HEADER );
		const src = res.getHeader( SRC_URL_HEADER );
		return { src, mediaId, guid };
	};

	const extractHeadersFromFetch = res => {
		const guid = res.headers.get( GUID_HEADER );
		const mediaId = res.headers.get( MEDIA_ID_HEADER );
		const src = res.headers.get( SRC_URL_HEADER );
		return { src, mediaId, guid };
	};

	const triggerSuccessWhenGuidHeaderPresent = headers => {
		const { src, mediaId, guid } = headers;
		if ( guid && mediaId && src ) {
			onSuccess && onSuccess( { mediaId: Number( mediaId ), guid, src } );
			return true;
		}

		return false;
	};

	const methodNeedsUploadKey = method =>
		[ 'OPTIONS', 'GET', 'HEAD', 'DELETE', 'PUT', 'PATCH' ].indexOf( method ) >= 0;

	const startPollingForGuid = url => {
		console.log( url );
		// recursiveUrlRequest
		const numRetries = 10;
		const waitMs = 1000;
		let timerId = null;
		let retries = 0;
		const recursiveUrlRequest = function recursiveUrlRequest() {
			if ( retries > numRetries ) {
				timerId && clearTimeout( timerId );
				onError && onError();
				return;
			}

			retries += 1;

			const method = 'HEAD';
			const maybeUploadkey = extractUploadKeyForUrl( url );
			getJwtForKey( maybeUploadkey, method ).then( token => {
				const headers = {
					'x-videopress-upload-token': token,
					'X-HTTP-Method-Override': method,
				};

				fetch( url, {
					headers,
					method: 'GET',
				} ).then( response => {
					if ( ! response.ok ) {
						// fail, error out?
						return;
					}

					const responseHeaders = extractHeadersFromFetch( response );

					if ( ! triggerSuccessWhenGuidHeaderPresent( responseHeaders ) ) {
						timerId = setTimeout( () => recursiveUrlRequest(), waitMs );
					}
				} );
				// resolve( req );
			} );
		};

		recursiveUrlRequest();
	};

	return ( file, data ) => {
		const upload = new tus.Upload( file, {
			onError: onError,
			onProgress: onProgress,
			endpoint: data.url,
			removeFingerprintOnSuccess: true,
			withCredentials: false,
			autoRetry: true,
			overridePatchMethod: false,
			chunkSize: 10000000, // 10 Mb.
			allowedFileTypes: [ 'video/*' ],
			metadata: {
				filename: file.name,
				filetype: file.type,
			},
			retryDelays: [ 0, 1000, 3000, 5000, 10000 ],
			onSuccess: function () {
				const successfulUploadUrl = upload.url;
				startPollingForGuid( successfulUploadUrl );
			},
			onAfterResponse: function ( req, res ) {
				// Why is this not showing the x-headers?
				if ( res.getStatus() >= 400 ) {
					return;
				}

				const responseHeaders = extractHeadersFromXhr( res );

				if ( triggerSuccessWhenGuidHeaderPresent( responseHeaders, onSuccess ) ) {
					return;
				}

				const headerMap = {
					'x-videopress-upload-key-token': 'token',
					'x-videopress-upload-key': 'key',
				};

				const tokenData = {};
				Object.keys( headerMap ).forEach( function ( header ) {
					const value = res.getHeader( header );
					if ( ! value ) {
						return;
					}

					tokenData[ headerMap[ header ] ] = value;
				} );

				if ( tokenData.key && tokenData.token ) {
					jwtsForKeys[ tokenData.key ] = tokenData.token;
				}
			},
			onBeforeRequest: function ( req ) {
				const method = req._method;
				const hasJWT = !! data.token;
				// make ALL requests be either POST or GET to honor the public-api.wordpress.com "contract".
				if ( [ 'HEAD', 'OPTIONS' ].indexOf( method ) >= 0 ) {
					req._method = 'GET';
					req.setHeader( 'X-HTTP-Method-Override', method );
				}

				if ( [ 'DELETE', 'PUT', 'PATCH' ].indexOf( method ) >= 0 ) {
					req._method = 'POST';
					req.setHeader( 'X-HTTP-Method-Override', method );
				}

				req._xhr.open( req._method, req._url, true );
				// Set the headers again, reopening the xhr resets them.
				Object.keys( req._headers ).map( function ( headerName ) {
					req.setHeader( headerName, req._headers[ headerName ] );
				} );

				if ( 'POST' === method ) {
					if ( hasJWT ) {
						req.setHeader( 'x-videopress-upload-token', data.token );
						return Promise.resolve( req );
					}
					// Upload CREATE methods should ALWAYS have a JWT.
					return Promise.reject( 'should never happen' );
				}

				return new Promise( ( resolve, reject ) => {
					if ( methodNeedsUploadKey( method ) ) {
						const maybeUploadkey = extractUploadKeyForUrl( req._url );
						getJwtForKey( maybeUploadkey, method ).then( token => {
							req.setHeader( 'x-videopress-upload-token', token );
							resolve( req );
						}, reject );
					} else {
						resolve( req );
					}
				} );
			},
		} );

		upload.findPreviousUploads().then( function ( previousUploads ) {
			if ( previousUploads.length ) {
				upload.resumeFromPreviousUpload( previousUploads[ 0 ] );
			}

			upload.start();
		} );

		return upload;
	};
};
