<script>
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { range, floor, concat } from 'lodash-es';
	import Splineplot from './Splineplot.svelte';
	import SplineControls from './SplineControls.svelte';
	import * as interpolation from './Interpolation.js';

	let svg;
	let width = 500;
	let height = 500;
	let xTicks = [];
	let yTicks = [];
	let spline_fn = interpolation.linear_interpolation_of_points;

	const padding = { top: 50, right: 50, bottom: 50, left: 50 };
	$: graphWidth = width - (padding.left + padding.right);
	$: graphHeight = height - (padding.top + padding.bottom);

	$: xLsY = width < height;
	$: yLsX = height < width;

	// If y>x then the width is a percentage.
	// If x>y then the height is a percentage.
  // If x==y then they are both 100% of the whole.
	$: xRatio = xLsY? width/height : 1;
	$: yRatio = yLsX? height/width : 1;

	$: xMax = floor(1000*xRatio);
	$: yMax = floor(1000*yRatio);
	$: xTicks = concat(range(0, xMax+1, 25), xMax)
	$: yTicks = concat(range(0, yMax+1, 25), yMax)

	$: tickXScale = scaleLinear()
		.domain([0, xMax])
		.range([padding.left, width - padding.right]);

	$: tickYScale = scaleLinear()
		.domain([0, yMax])
		.range([height - padding.bottom, padding.top]);

	$: xScale = scaleLinear()
		.domain([0, xMax])
		.range([0, graphWidth]);

	$: yScale = scaleLinear()
		.domain([0, yMax])
		.range([graphHeight, 0]);

	onMount(resize);

	function resize() {
		({ width, height } = svg.getBoundingClientRect());
	}
</script>

<svelte:window on:resize='{resize}'/>

<div><SplineControls bind:spline_fn={spline_fn}/></div>

<svg bind:this={svg}>
	<!-- y axis -->
	<g class='axis y-axis'>
		{#each yTicks as tick}
			<g class='tick tick-{tick}' transform='translate(0, {tickYScale(tick)})'>
				<line x1='{padding.left}' x2='{tickXScale(xMax)}'/>
				{#if tick%100==0}
					<text x='{padding.left - 8}' y='+4'>{tick}</text>
				{/if}
			</g>
		{/each}
	</g>

	<!-- x axis -->
	<g class='axis x-axis'>
		{#each xTicks as tick}
			<g class='tick' transform='translate({tickXScale(tick)},0)'>
				<line y1='{tickYScale(0)}' y2='{tickYScale(yMax)}'/>
				{#if tick%100==0}
					<text y='{height - padding.bottom + 16}'>{tick}</text>
				{/if}
			</g>
		{/each}
	</g>

	<Splineplot spline_fn={spline_fn}
		x={padding.left} y={padding.bottom}
		width={graphWidth} height={graphHeight}
		xScale={xScale} yScale={yScale} yMax={yMax}
	/>
</svg>

<style>
	svg {
		width: 75%;
		height: 100%;
		float: right;
	}

	.tick line {
		stroke: #ddd;
		stroke-dasharray: 2;
	}

	text {
		font-size: 12px;
		fill: #999;
	}

	.x-axis text {
		text-anchor: middle;
	}

	.y-axis text {
		text-anchor: end;
	}

	div {
		width: 23%;
		padding-top: 2%;
		padding-left: 2%;
		float: left;
	}

</style>
