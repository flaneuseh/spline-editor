<script>
	import * as interpolation from './Interpolation.js';
	export let spline_fn = interpolation.linear_interpolation_of_points;

	const options = [
		{
			label: "Linear Interpolated",
			spline_fn: interpolation.linear_interpolation_of_points,
		},
		{
			label: "Bezier (groups of 4 points)",
			spline_fn: interpolation.bezier_interpolation_of_points,
		},
		{
			label: "B-Spline",
			spline_fn: interpolation.bspline_interpolation_of_points,
		},
		{
			label: "Catmull-Rom",
			spline_fn: interpolation.catmullrom_interpolation_of_points,
		},
		{
			label: "C2 Interpolated",
			spline_fn: interpolation.c2_interpolation_of_points,
		},
	]
</script>

<h2>Spline Function</h2>
{#each options as option}
	<label>
		<input type=radio bind:group={spline_fn} name="spline_fn" value={option.spline_fn}>
		{option.label}
	</label>
{/each}
<p>Click anywhere to add a point!</p>
<p>Hover over a point to see its coordinates, and click and drag to move.</p>
