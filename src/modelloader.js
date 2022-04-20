import { isCompositeComponent } from 'react-dom/cjs/react-dom-test-utils.production.min';
import configuration from './configfiles/configuration.json';

const colors = [
  0x144414,
  0x441414,
  0x141444,
  0x134413,
  0x441313,
  0x131344,
  0x142414,
  0x241414,
  0x141424,
];

class ModelLoader {
  constructor(modelName) {
    this.modelName = modelName;

    this.packagerHost = configuration.services.modelPackager.host;
    this.packagerPort = configuration.services.modelPackager.port;
    this.basePackagerUrl = this.packagerHost + ':' + this.packagerPort;
  }

  Initialize(modelHandler) {
    fetch(this.basePackagerUrl + '/model/' + this.modelName + '/population', { method: 'GET', mode: 'cors' })
    .then(data => data.json())
    .then(response => {

      var layout = [];
      var layerHandles = [];
      var startPosition = [0, 0, 0];
      var colorIndex = 0;
      var handleOffset = -1 * response.templates.length;
      for (var template of response.templates) {
        console.log(template);
        const widths = Object.keys(template.indexes).map(layer => template.indexes[layer].shape[0]);
        const handleSideOffset = Math.max(...widths) + 4;

        for (var layer in template.indexes) {
          const startingNeuron = layout.length;
          layout = layout.concat(this.layoutRasterSquare(template.indexes[layer].shape, startPosition, colors[colorIndex]));
          const engingNeuron = layout.length;

          layerHandles.push({ position: [handleSideOffset, startPosition[1], startPosition[2] + handleOffset], color: colors[colorIndex], range: [startingNeuron, engingNeuron] });
          handleOffset += 2;

          startPosition[1] += 2;

          colorIndex++;
          if (colorIndex > colors.length) {
            colorIndex = 0;
          }
        }

        startPosition[1] = 0;
        startPosition[2] += (template.indexes[layer].shape[1] + 2) * 2;
      }

      if (modelHandler) {
        modelHandler(layout, layerHandles);
      }
    });
  }

  layoutRasterSquare(dimensions, startPosition, color) {
    const [startX, startY, startZ] = startPosition;
    const [maxX, maxZ] = dimensions;

    var lowX = maxX / -2;
    var highX = maxX / 2;
    if (maxX %2 !== 0) {
      lowX = (maxX - 1) / -2;
      highX = (maxX + 1) / 2;
    }

    var lowZ = maxZ / -2;
    var highZ = maxZ / 2;
    if (maxZ %2 !== 0) {
      lowZ = (maxZ - 1) / -2;
      highZ = (maxZ + 1) / 2;
    }

    var layout = [];
    for (var z = lowZ; z < highZ; z++) {
      for (var x = lowX; x < highX; x++) {
        layout.push({ position: [startX + (x * 2), startY, startZ + (z * 2)], color: color, trigger: null });
      }
    }

    return layout;
  }

}

export { ModelLoader };
