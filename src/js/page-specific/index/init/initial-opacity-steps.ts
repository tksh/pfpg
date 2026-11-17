import { resolveDefaultOpacitySteps } from "libpfpg/opacity-steps";
import { currentLinesData } from "state/render-state";

export { calculateStepsFromTwoOpacities, getInitialOpacitySteps };

// Get initial opacity steps from original lines data
function getInitialOpacitySteps(): number {
  // Get the whole lines data from the artwork decoded at startup
  const decodedLinesByGroups = currentLinesData();
  // e.g.: Map(3) {0 => {…}, 1 => {…}, 2 => {…}}

  return calculateStepsFromTwoOpacities(decodedLinesByGroups);
}

// Get the opacity steps from url param value
function calculateStepsFromTwoOpacities(
  dataByGroups: Map<
    unknown,
    {
      groupColors: {
        gOpacity: string | number;
        gStrokeOpacity: string | number;
      };
    }
  >,
): number {
  // Extract the values of opacities / e.g.: (3) ['1.0', '1.0', '1.0']
  const opArr = [...dataByGroups.values()].map((data) =>
    data.groupColors.gOpacity
  );
  const soArr = [...dataByGroups.values()].map((data) =>
    data.groupColors.gStrokeOpacity
  );

  // Convert the type to number / e.g.: (3) [1.0, 1.0, 1.0]
  const opNumArray = opArr.map((value) => Number(value));
  const soNumArray = soArr.map((value) => Number(value));

  // Find largest step selected from [0.2, 0.1, 0.04] for each attr
  const opLargestStep = resolveDefaultOpacitySteps(opNumArray);
  const soLargestStep = resolveDefaultOpacitySteps(soNumArray);

  // Select smaller step value to get 'opacity steps' value for this artwork
  const steps = Math.min(opLargestStep, soLargestStep);

  return steps;
}
