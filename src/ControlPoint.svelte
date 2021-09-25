<script>
import { round } from 'lodash-es';
import { draggable } from 'svelte-drag';

	export let x, y, xScale, yScale, yMax;
	export let removeFn;

	const oX = x;
	const oY = y;

	function drag(e) {
		x = round(oX + xScale.invert(e.detail.offsetX));
		// Need yMax for y because y scales from highest to lowest.
		y = round(oY - yMax + yScale.invert(e.detail.offsetY));
	}

</script>

<circle cx='{xScale(oX)}' cy='{yScale(oY)}' r='5'
	use:draggable={{ bounds: 'parent'}}
	on:svelte-drag={drag}
	on:dblclick={removeFn}
>
	<title>({round(x)}, {round(y)})</title>
</circle>

<style>
	circle {
		fill: orange;
		fill-opacity: 0.6;
		stroke: rgba(0,0,0,0.5);
		cursor: move;
	}
</style>
