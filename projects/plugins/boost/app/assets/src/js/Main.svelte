<script>
	import BenefitsInterstitial from './pages/benefits/BenefitsInterstitial.svelte';
	import Connection from './pages/connection/Connection.svelte';
	import PurchaseSuccess from './pages/purchase-success/PurchaseSuccess.svelte';
	import Settings from './pages/settings/Settings.svelte';
	import Footer from './sections/Footer.svelte';
	import Header from './sections/Header.svelte';
	import config from './stores/config';
	import { connection } from './stores/connection';
	import { Router, Route } from './utils/router';
	import routerHistory from './utils/router-history';
</script>

<Router history={routerHistory}>
	<Route path="upgrade" component={BenefitsInterstitial} />
	<Route path="purchase-successful" component={PurchaseSuccess} />
	<Route>
		<div id="jb-settings" class="jb-settings jb-settings--main">
			<div class="jb-container">
				<Header />
			</div>

			{#if $connection.connected || ! config.site.online}
				<Settings />
			{:else}
				<Connection />
			{/if}

			<Footer />
		</div>
	</Route>
</Router>
