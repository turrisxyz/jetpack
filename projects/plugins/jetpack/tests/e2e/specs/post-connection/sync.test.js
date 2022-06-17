import { test, expect } from 'jetpack-e2e-commons/fixtures/base-test.js';
import { execWpCommand } from 'jetpack-e2e-commons/helpers/utils-helper.cjs';
import {
	enableSync,
	disableSync,
	enableDedicatedSync,
	disableDedicatedSync,
	isSyncQueueEmpty,
} from '../../helpers/sync-helper.js';
import { BlockEditorPage } from 'jetpack-e2e-commons/pages/wp-admin/index.js';
import { prerequisitesBuilder } from 'jetpack-e2e-commons/env/index.js';
import playwrightConfig from '../../playwright.config.cjs';

test.describe( 'Sync', () => {
	const wpcomRestAPIBase = 'https://public-api.wordpress.com/rest/';
	let blockEditor;
	let wpcomBlogId;
	let wpcomForcedPostsUrl;
	let wpcomPostsResponse;
	let wpcomPosts;

	test.beforeAll( async ( { browser } ) => {
		const page = await browser.newPage( playwrightConfig.use );
		await prerequisitesBuilder( page ).withLoggedIn( true ).withConnection( true ).build();
		await page.close();

		const jetpackOptions = await execWpCommand( 'option get jetpack_options --format=json' );
		wpcomBlogId = JSON.parse( jetpackOptions ).id;
		wpcomForcedPostsUrl =
			wpcomRestAPIBase + `v1/sites/${ wpcomBlogId }/posts?force=wpcom&search=Sync`;
	} );

	test.beforeEach( async ( { page } ) => {
		await test.step( 'Visit block editor page', async () => {
			blockEditor = await BlockEditorPage.visit( page );
			await blockEditor.resolveWelcomeGuide( false );

			await assertSyncQueueIsEmpty( 'Sync queue should be empty [before]' );
		} );
	} );

	test.afterEach( async () => {
		await test.step( 'Reset Sync defaults', async () => {
			await enableSync();
			await disableDedicatedSync();
		} );
	} );

	test( 'Normal Sync flow', async ( { page } ) => {
		const postTitle = `Normal Sync ${ Date.now() }`;

		await test.step( 'Publish a post', async () => {
			await publishPost( postTitle );
			await blockEditor.viewPost();
		} );

		await test.step( 'Assert post is synced', async () => {
			await assertSyncQueueIsEmpty( 'Sync queue should be empty [after post publish]' );

			wpcomPostsResponse = await page.request.get( wpcomForcedPostsUrl );
			expect( wpcomPostsResponse.ok(), 'WPCOM get posts response is OK' ).toBeTruthy();

			wpcomPosts = await wpcomPostsResponse.json();
			expect(
				wpcomPosts.posts,
				'Previously created post should be present in the synced posts'
			).toContainEqual(
				expect.objectContaining( {
					title: 'Testing Sync',
				} )
			);
		} );
	} );

	test( 'Disabled Sync Flow', async ( { page } ) => {
		await test.step( 'Disabled Sync', async () => {
			const syncDisabled = await disableSync();
			expect( syncDisabled ).toMatch( 'Sync Disabled' );
		} );

		const postTitle = `Disabled Sync ${ Date.now() }`;

		await test.step( 'Publish a post', async () => {
			await publishPost( postTitle );
			await blockEditor.viewPost();
		} );

		await test.step( 'Assert post is not synced', async () => {
			wpcomPostsResponse = await page.request.get( wpcomForcedPostsUrl );
			expect( wpcomPostsResponse.ok(), 'WPCOM get posts response is OK' ).toBeTruthy();

			wpcomPosts = await wpcomPostsResponse.json();
			expect(
				wpcomPosts.posts,
				'Previously created post should NOT be present in the synced posts'
			).toContainEqual(
				expect.not.objectContaining( {
					title: 'Disabled Sync',
				} )
			);
		} );
	} );

	test( 'Dedicated Sync Flow', async ( { page } ) => {
		await test.step( 'Enable Dedicated Sync', async () => {
			const dedicatedSyncEnabled = await enableDedicatedSync();
			expect( dedicatedSyncEnabled ).toMatch( 'Success' );
		} );

		const postTitle = `Dedicated Sync ${ Date.now() }`;

		await test.step( 'Publish a post', async () => {
			await publishPost( postTitle );
			await blockEditor.viewPost();
		} );

		await test.step( 'Assert post is synced', async () => {
			await assertSyncQueueIsEmpty( 'Sync queue should be empty [after post publish]' );

			wpcomPostsResponse = await page.request.get( wpcomForcedPostsUrl );
			expect( wpcomPostsResponse.ok(), 'WPCOM get posts response is OK' ).toBeTruthy();

			wpcomPosts = await wpcomPostsResponse.json();
			expect(
				wpcomPosts.posts,
				'Previously created post should be present in the synced posts'
			).toContainEqual(
				expect.objectContaining( {
					title: postTitle,
				} )
			);
		} );
	} );

	async function publishPost( title ) {
		await blockEditor.setTitle( title );
		await blockEditor.selectPostTitle();
		await blockEditor.publishPost();
	}

	async function assertSyncQueueIsEmpty( message = 'Sync queue should be empty', timeout = 30000 ) {
		await expect
			.poll(
				async () => {
					return await isSyncQueueEmpty();
				},
				{
					message,
					timeout,
				}
			)
			.toBeTruthy();
	}
} );
