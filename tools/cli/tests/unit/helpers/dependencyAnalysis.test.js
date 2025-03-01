import { fileURLToPath } from 'url';
import { getDependencies, filterDeps, getBuildOrder } from '../../../helpers/dependencyAnalysis.js';

const dataDir = fileURLToPath( new URL( '../../data', import.meta.url ) );

const compareDeps = ( actual, xpect ) => {
	expect( actual ).toBeInstanceOf( Map );
	const map = {};
	for ( const [ k, v ] of actual ) {
		expect( v ).toBeInstanceOf( Set );
		map[ k ] = [ ...v ];
	}
	expect( map ).toEqual( xpect );
};

describe( 'dependencyAnalysis', () => {
	describe( 'getDependencies', () => {
		test( 'monorepo', async () => {
			const ret = await getDependencies( dataDir + '/monorepo' );
			compareDeps( ret, {
				monorepo: [ 'packages/a' ],
				'packages/a': [],
				'packages/b': [ 'packages/a' ],
				'packages/c': [ 'js-packages/d', 'js-packages/e', 'packages/a', 'packages/b' ],
				'js-packages/d': [],
				'js-packages/e': [],
				'js-packages/f': [],
			} );
		} );

		test( 'monorepo, build deps', async () => {
			const ret = await getDependencies( dataDir + '/monorepo', 'build' );
			compareDeps( ret, {
				monorepo: [ 'packages/a' ],
				'packages/a': [],
				'packages/b': [ 'packages/a' ],
				'packages/c': [ 'js-packages/d', 'js-packages/e', 'packages/a', 'packages/b' ],
				'js-packages/d': [],
				'js-packages/e': [],
				'js-packages/f': [ 'packages/b' ],
			} );
		} );

		test( 'monorepo, test deps', async () => {
			const ret = await getDependencies( dataDir + '/monorepo', 'test' );
			compareDeps( ret, {
				monorepo: [ 'packages/a' ],
				'packages/a': [],
				'packages/b': [ 'packages/a' ],
				'packages/c': [ 'js-packages/d', 'js-packages/e', 'packages/a', 'packages/b' ],
				'js-packages/d': [],
				'js-packages/e': [],
				'js-packages/f': [ 'js-packages/d', 'js-packages/e' ],
			} );
		} );

		test( 'monorepo-cycle', async () => {
			const ret = await getDependencies( dataDir + '/monorepo-cycle' );
			compareDeps( ret, {
				monorepo: [ 'packages/a' ],
				'packages/a': [],
				'packages/b': [ 'packages/a', 'packages/c' ],
				'packages/c': [ 'packages/a', 'packages/b' ],
			} );
		} );
	} );

	describe( 'filterDeps', () => {
		test( 'listed packages', async () => {
			const deps = await getDependencies( dataDir + '/monorepo', 'build' );
			deps.delete( 'monorepo' );
			const filteredDeps = filterDeps( deps, [ 'packages/a', 'packages/b', 'packages/c' ] );
			compareDeps( filteredDeps, {
				'packages/a': [],
				'packages/b': [ 'packages/a' ],
				'packages/c': [ 'packages/a', 'packages/b' ],
			} );
		} );

		test( 'dependencies', async () => {
			const deps = await getDependencies( dataDir + '/monorepo', 'build' );
			const filteredDeps = filterDeps( deps, [ 'js-packages/f' ], { dependencies: true } );
			compareDeps( filteredDeps, {
				'packages/a': [],
				'packages/b': [ 'packages/a' ],
				'js-packages/f': [ 'packages/b' ],
			} );
		} );

		test( 'dependents', async () => {
			const deps = await getDependencies( dataDir + '/monorepo', 'build' );
			const filteredDeps = filterDeps( deps, [ 'packages/b' ], { dependents: true } );
			compareDeps( filteredDeps, {
				'packages/b': [],
				'packages/c': [ 'packages/b' ],
				'js-packages/f': [ 'packages/b' ],
			} );
		} );

		test( 'dependencies and dependents', async () => {
			const deps = await getDependencies( dataDir + '/monorepo' );
			const filteredDeps = filterDeps( deps, [ 'packages/b' ], {
				dependencies: true,
				dependents: true,
			} );
			compareDeps( filteredDeps, {
				monorepo: [ 'packages/a' ],
				'packages/a': [],
				'packages/b': [ 'packages/a' ],
				'packages/c': [ 'js-packages/d', 'js-packages/e', 'packages/a', 'packages/b' ],
				'js-packages/d': [],
				'js-packages/e': [],
			} );
		} );
	} );

	describe( 'getBuildOrder', () => {
		test( 'monorepo', async () => {
			const deps = await getDependencies( dataDir + '/monorepo', 'build' );
			deps.delete( 'monorepo' );
			expect( getBuildOrder( deps ) ).toEqual( [
				[ 'js-packages/d', 'js-packages/e', 'packages/a' ],
				[ 'packages/b' ],
				[ 'js-packages/f', 'packages/c' ],
			] );
		} );

		test( 'monorepo-cycle', async () => {
			const deps = await getDependencies( dataDir + '/monorepo-cycle', 'build' );
			deps.delete( 'monorepo' );

			let err;
			expect( () => {
				try {
					getBuildOrder( deps );
				} catch ( e ) {
					err = e;
					throw e;
				}
			} ).toThrow( 'The dependency graph contains a cycle!' );
			compareDeps( err.deps, {
				'packages/b': [ 'packages/c' ],
				'packages/c': [ 'packages/b' ],
			} );
		} );
	} );
} );
