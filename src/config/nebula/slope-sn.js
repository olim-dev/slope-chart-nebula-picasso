import {
  useElement,
  useState,
  useStaleLayout,
  useRect,
  useEffect,
} from '@nebula.js/stardust';
import picassojs from 'picasso.js';
import picassoQ from 'picasso-plugin-q';
import numeral from 'numeral';
import { format } from 'd3-format';

export default function supernova() {
  const picasso = picassojs();
  picasso.use(picassoQ);

  return {
    qae: {
      properties: {
        qHyperCubeDef: {
          qDimensions: [],
          qMeasures: [],
          qInitialDataFetch: [{ qWidth: 4, qHeight: 2500 }],
          qSuppressZero: false,
          qSuppressMissing: true,
        },
        showTitles: true,
        title: '',
        subtitle: '',
        footnote: '',
      },
      data: {
        targets: [
          {
            path: '/qHyperCubeDef',
            dimensions: {
              min: 1,
              max: 2,
            },
            measures: {
              min: 1,
              max: 2,
            },
          },
        ],
      },
    },
    component() {
      const element = useElement();
      const layout = useStaleLayout();
      const rect = useRect();

      const [instance, setInstance] = useState();

      useEffect(() => {
        const formatterGtoB = () => (value) => format('.1s')(value).replace(/G/, 'B'); // .1s for no decimal on Billions
        picasso.formatter('formatterGtoB', formatterGtoB);
        const p = picasso.chart({
          element,
          data: [],
          settings: {},
        });

        setInstance(p);

        return () => {
          p.destroy();
        };
      }, []);

      useEffect(() => {
        if (!instance) {
          return;
        }

        const layoutData = layout.qHyperCube.qDataPages[0].qMatrix;

        // y-axis ticks
        const yaxisVals = [];
        layoutData.filter((d) => d[0].qText === '2020').map((d) => yaxisVals.push({
          value: d[2].qNum,
          label: `${d[2].qNum} - ${d[1].qText}`,
        }));
        yaxisVals.sort((a, b) => a.value - b.value);

        // y-axis-end ticks
        const yaxisendVals = [];
        layoutData.filter((d) => d[0].qText === '2021').map((d) => yaxisendVals.push({
          value: d[2].qNum,
          label: `${d[2].qNum} - ${d[1].qText}`,
        }));
        yaxisendVals.sort((a, b) => a.value - b.value);

        // Rank Change
        const rankChange = {};
        const profitsChange = {};

        layoutData.forEach((d) => {
          if (Object.prototype.hasOwnProperty.call(rankChange, d[1].qText)) {
            rankChange[d[1].qText] -= d[2].qNum;
          } else {
            rankChange[d[1].qText] = d[2].qNum;
          }
        });

        layoutData.forEach((d) => {
          if (Object.prototype.hasOwnProperty.call(profitsChange, d[1].qText)) {
            profitsChange[d[1].qText] = d[3].qNum - profitsChange[d[1].qText];
          } else {
            profitsChange[d[1].qText] = d[3].qNum;
          }
        });

        instance.update({
          data: [
            {
              type: 'q',
              key: 'qHyperCube',
              data: layout.qHyperCube,
            },
          ],
          settings: {
            strategy: {
              center: {
                minWidthRatio: 0,
              },
              layoutModes: {
                S: { width: 400, height: 50 },
              },
            },
            formatters: {
              formatterGtoB: {
                type: 'formatterGtoB',
              },
            },
            scales: {
              x: {
                data: {
                  extract: {
                    field: 'qDimensionInfo/0',
                  },
                },
                paddingInner: 0.8,
                paddingOuter: 0,
              },
              color: {
                data: {
                  extract: {
                    field: 'qDimensionInfo/1',
                  },
                },
                range: ['#5D627E'],
                type: 'color',
              },
              y: {
                data: {
                  field: 'qMeasureInfo/0',
                },
                invert: false,
                expand: 0.03,
                type: 'linear',
                ticks: { values: yaxisVals },
              },
              yend: {
                data: {
                  field: 'qMeasureInfo/0',
                },
                invert: false,
                expand: 0.03,
                type: 'linear',
                ticks: { values: yaxisendVals },
              },
            },
            components: [
              {
                type: 'axis',
                key: 'x-axis',
                scale: 'x',
                dock: 'bottom',
                settings: {
                  labels: {
                    show: true,
                    fontSize: '10px',
                    mode: 'horizontal',
                  },
                },
              },
              {
                type: 'axis',
                key: 'y-axis',
                scale: 'y',
                settings: {
                  labels: {
                    show: true,
                    mode: 'layered',
                    fontSize: '10px',
                    filterOverlapping: false,
                  },
                },
                layout: {
                  show: true,
                  dock: 'left',
                  minimumLayoutMode: 'S',
                },
              },
              {
                type: 'axis',
                key: 'y-axis-end',
                scale: 'yend',
                settings: {
                  labels: {
                    show: true,
                    mode: 'layered',
                    fontSize: '10px',
                    filterOverlapping: false,
                  },
                },
                layout: {
                  show: true,
                  dock: 'right',
                },
              },
              {
                type: 'line',
                key: 'lines',
                data: {
                  extract: {
                    field: 'qDimensionInfo/0',
                    props: {
                      y: {
                        field: 'qMeasureInfo/0',
                      },
                      series: {
                        field: 'qDimensionInfo/1',
                      },
                    },
                  },
                },
                settings: {
                  coordinates: {
                    major: {
                      scale: 'x',
                    },
                    minor: {
                      scale: 'y',
                      ref: 'y',
                    },
                    minor0: {
                      scale: 'y',
                    },
                    layerId: {
                      ref: 'series',
                    },
                  },
                  orientation: 'horizontal',
                  layers: {
                    sort: (a, b) => a.id - b.id,
                    curve: 'monotone',
                    line: {
                      stroke: {
                        scale: 'color',
                        ref: 'series',
                      },
                      strokeWidth: 2,
                      opacity: 0.8,
                    },
                  },
                },
                brush: {
                  consume: [{
                    context: 'increase',
                    style: {
                      active: {
                        stroke: '#53A4B1',
                        opacity: 1,
                      },
                      inactive: {
                        stroke: '#BEBEBE',
                        opacity: 0.45,
                      },
                    },
                  },
                  {
                    context: 'decrease',
                    style: {
                      active: {
                        stroke: '#A7374E',
                        opacity: 1,
                      },
                      inactive: {
                        stroke: '#BEBEBE',
                        opacity: 0.45,
                      },
                    },
                  }],
                },
              },
              {
                type: 'point',
                key: 'point',
                displayOrder: 1,
                data: {
                  extract: {
                    field: 'qDimensionInfo/0',
                    props: {
                      x: {
                        field: 'qDimensionInfo/0',
                      },
                      y: {
                        field: 'qMeasureInfo/0',
                      },
                      ind: {
                        field: 'qDimensionInfo/1',
                      },
                      rank: {
                        field: 'qMeasureInfo/0',
                      },
                      rev: {
                        field: 'qMeasureInfo/1',
                      },
                    },
                  },
                },
                settings: {
                  x: { scale: 'x' },
                  y: { scale: 'y' },
                  shape: 'circle',
                  size: 0.2,
                  strokeWidth: 2,
                  stroke: '#5D627E',
                  fill: '#5D627E',
                  opacity: 0.8,
                },
                brush: {
                  consume: [{
                    context: 'increase',
                    style: {
                      active: {
                        fill: '#53A4B1',
                        stroke: '#53A4B1',
                        opacity: 1,
                      },
                      inactive: {
                        fill: '#BEBEBE',
                        stroke: '#BEBEBE',
                        opacity: 0.45,
                      },
                    },
                  },
                  {
                    context: 'decrease',
                    style: {
                      active: {
                        fill: '#A7374E',
                        stroke: '#A7374E',
                        opacity: 1,
                      },
                      inactive: {
                        fill: '#BEBEBE',
                        stroke: '#BEBEBE',
                        opacity: 0.45,
                      },
                    },
                  }],
                },
              },
              {
                key: 'tooltip',
                type: 'tooltip',
                displayOrder: 10,
                settings: {
                  // Target point marker
                  filter: (nodes) => nodes.filter((node) => node.key === 'point' && node.type === 'circle'),
                  // Extract data
                  extract: ({ node, resources }) => {
                    const obj = {};
                    obj.year = node.data.x.label;
                    obj.industry = node.data.ind.label;
                    obj.rank = node.data.rank.value;
                    obj.rankchange = rankChange[obj.industry];
                    obj.profitsChange = profitsChange[obj.industry];
                    obj.profits = resources.formatter({ type: 'd3-number', format: '.3s' })(node.data.rev.value);
                    return obj;
                  },
                  // Generate tooltip content
                  content: ({ h, data }) => {
                    const els = [];
                    let elarrow = null;
                    let rankCh = '';
                    data.forEach((node) => {
                      // Title
                      const elh = h('td', {
                        colspan: '3',
                        style: { fontWeight: 'bold', 'text-align': 'left', padding: '0 5px' },
                      }, `${node.year} ${node.industry}`);

                      const el1 = h('td', { style: { padding: '0 5px' } }, 'Rank');
                      const el2 = h('td', { style: { padding: '0 5px' } }, `#${node.rank}`);
                      // Rank Change
                      if (node.rankchange > 0 && node.year !== '2020') {
                        rankCh = `+${node.rankchange}`;
                        elarrow = h('div', {
                          style: {
                            width: '0px', height: '0px', 'border-left': '5px solid transparent', 'border-right': '5px solid transparent', 'border-bottom': '5px solid #008000',
                          },
                        }, '');
                      } else if (node.rankchange < 0 && node.year !== '2020') {
                        rankCh = node.rankchange;
                        elarrow = h('div', {
                          style: {
                            width: '0px', height: '0px', 'border-left': '5px solid transparent', 'border-right': '5px solid transparent', 'border-top': '5px solid #FF0000',
                          },
                        }, '');
                      } else {
                        rankCh = '';
                        elarrow = '';
                      }
                      // Rest of Info
                      const el3 = h('td', {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                        },
                      }, [rankCh, elarrow]);
                      const elr1 = h('tr', {}, [el1, el2, el3]);
                      const elr2 = h('tr', {}, [h('td', { style: { padding: '0 5px' } }, 'Profits:'), h('td', { style: { padding: '0 5px' } }, node.profits.replace(/G/, 'B')), h('td', {}, (node.year !== '2020') ? `${numeral(node.profitsChange).format('+0a').toUpperCase()}` : '')]);
                      els.push(h('tr', {}, [elh]), elr1, elr2);
                    });

                    return h('table', {}, els);
                  },
                  placement: {
                    type: 'pointer',
                    area: 'target',
                    dock: 'auto',
                  },
                },
              },
            ],
            interactions: [
              {
                type: 'native',
                events: {
                  mousemove(e) {
                    this.chart.component('tooltip').emit('show', e);
                  },
                  mouseleave() {
                    this.chart.component('tooltip').emit('hide');
                  },
                },
              },
            ],
          },
        });

        window.slopeInstance = instance;
      }, [layout, instance]);

      useEffect(() => {
        if (!instance) {
          return;
        }
        instance.update();
      }, [rect.width, rect.height, instance]);
    },
  };
}
