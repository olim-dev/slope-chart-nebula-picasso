import React, { useRef, useEffect, useState } from 'react';
import useNebula from 'hooks/useNebula';
import Button from '@material-ui/core/Button';

const Slope = () => {
  const elementRef = useRef();
  const chartRef = useRef();
  const nebula = useNebula();

  const [toggleBrush, setToggleBrush] = useState(false);

  // qElemNumbers to brush
  const increaseValues = [11, 16, 17, 5, 8, 12];
  const decreaseValues = [4, 6, 19];

  useEffect(async () => {
    if (!nebula) return;

    chartRef.current = await nebula.render({
      element: elementRef.current,
      type: 'slope',
      fields: [
        '[Issue Published Year]',
        '[Sector2]',
        '=Rank(Sum({$<[Issue Published Year]={2020, 2021}>} [Inflation Adjusted Sector Profit]))',
        '=Sum({$<[Issue Published Year]={2020, 2021}>} [Inflation Adjusted Sector Profit])',
      ],
    });
  }, [nebula]);

  useEffect(() => {
    if (!nebula || !window.slopeInstance) return;
    const highlighterIncrease = window.slopeInstance.brush('increase');
    const highlighterDecrease = window.slopeInstance.brush('decrease');
    highlighterIncrease.start();
    highlighterIncrease.clear();

    highlighterDecrease.start();
    highlighterDecrease.clear();

    if (toggleBrush) {
      highlighterIncrease.addValues(increaseValues.map((val) => ({ key: 'qHyperCube/qDimensionInfo/1', value: val })));
    } else {
      highlighterDecrease.addValues(decreaseValues.map((val) => ({ key: 'qHyperCube/qDimensionInfo/1', value: val })));
    }
  }, [toggleBrush]);

  const handleClearBrushes = () => {
    if (!nebula || !window.slopeInstance) return;
    const highlighterIncrease = window.slopeInstance.brush('increase');
    const highlighterDecrease = window.slopeInstance.brush('decrease');

    highlighterIncrease.clear();
    highlighterIncrease.end();

    highlighterDecrease.clear();
    highlighterDecrease.end();
  };

  return (
    <div>
      <div id="slopeViz" ref={elementRef} style={{ height: 600, width: 800 }} />
      <Button onClick={() => setToggleBrush(!toggleBrush)}>{toggleBrush ? 'Highlight Decrease' : 'Highlight Increasae'}</Button>
      <Button onClick={() => handleClearBrushes()}>Clear Brushes</Button>
    </div>
  );
};

export default Slope;
