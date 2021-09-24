<script>
  import ControlPoint from './ControlPoint.svelte';
	import * as interpolation from './Interpolation.js';

  export let control_points = [], spline_fn = interpolation.linear_interpolation_of_points;
  export let x, y, width, height, xScale, yScale, yMax;
	let interpolated_points = [];
  let graph, clickArea;

  addPoint(100, 100);
	$: interpolated_points = spline_fn(control_points)

  function handleClick(e) {
		let pt = graph.createSVGPoint();

		// pass event coordinates
		pt.x = e.x;
		pt.y = e.y;

		// transform to SVG coordinates
		let graphP = pt.matrixTransform( clickArea.getScreenCTM().inverse() );

		// add new control point.
		addPoint(xScale.invert(graphP.x), yScale.invert(graphP.y));
	}
	function addPoint(x, y) {
		control_points = [...control_points, [x, y]];
	}

	let point_cmps = [];
	$: point_cmps = point_cmps.filter(cmp => cmp);
	const removePoint = (i) => {
		// control_points = [
		// 	...control_points.slice(0, i),
		// 	...control_points.slice(i + 1, control_points.length)
		// ];
	}
</script>

<svg bind:this={graph} x={x} y={y} width={width} height={height}>
  <rect bind:this={clickArea} x=0 y=0 width={width} height={height} on:click={handleClick}/>
  {#each control_points as [x, y], i}
    <ControlPoint bind:this={point_cmps[i]} bind:x={x} bind:y={y} xScale={xScale} yScale={yScale} yMax={yMax}
		removeFn={()=>removePoint(i)}/>
  {/each}
	{#each interpolated_points as point}
		<circle cx='{xScale(point[0])}' cy='{yScale(point[1])}' r='1'/>
  {/each}
</svg>

<style>
  rect {
		opacity: .1;
	}
</style>
