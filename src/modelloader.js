import { Configuration } from './configuration/configuration.js';

const squareMovement = {
  XINC: "xinc",
  ZINC: "zinc",
  XDEC: "xdec",
  ZDEC: "zdec",
  XZBUMP: "xzbump"
}

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

    this.movement = squareMovement.XINC;

    this.configuration = null;
    this.packagerHost = "";
    this.packagerPort = "";
    this.basePackagerUrl = "";
  }

  LoadConfiguration(modelHandler) {
    if (!this.configuration) {
      Configuration.getInstance(configuration => {
        this.configuration = configuration;
        this.extractConfiguration(modelHandler);
      });
    } else {
      this.extractConfiguration(modelHandler);
    }
  }

  extractConfiguration(modelHandler) {
    this.packagerHost = this.configuration.services.modelPackager.host;
    this.packagerPort = this.configuration.services.modelPackager.port;
    this.basePackagerUrl = this.packagerHost + ':' + this.packagerPort;

    this.fetchModels(modelHandler);
  }

  fetchModels(modelHandler) {
    fetch(this.basePackagerUrl + '/model/' + this.modelName + '/population', { method: 'GET', mode: 'cors' })
    .then(data => data.json())
    .then(response => {

      var layout = [];
      var startPosition = [0, 0, 0];
      var colorIndex = 0;
      for (var template of response.templates) {
        console.log(template);
        for (var layer in template.indexes) {
          layout = layout.concat(this.layoutSquare(template.indexes[layer].count, startPosition, colors[colorIndex]));
          startPosition[1] += 2;
        }
        startPosition[1] = 0;
        startPosition[2] += 22;

        colorIndex++;
        if (colorIndex > colors.length) {
          colorIndex = 0;
        }
      }

      if (modelHandler) {
        modelHandler(layout);
      }
    });
  }

  layoutSquare(count, startPosition, color) {
    const [startX, startY, startZ] = startPosition;
    var layout = [];
    if (count % 2 == 0) {
      var limits = { lowerLimit: 1, upperLimit: 0, movement: squareMovement.XZBUMP };
      var position = [ 1, 1 ];
    } else {
      var limits = { lowerLimit: 0, upperLimit: 0, movement: squareMovement.ZDEC };
      var position = [ 0, 1 ];
    }

    while (layout.length < count) {
      position = this.nextXZ(position, limits);
      layout.push({ position: [startX + (position[0] * 2), startY, startZ + (position[1] * 2)], color: color, trigger: null });
    }

    return layout;
  }

  nextXZ(position, limits) {
    var [x, z] = position;

    switch (limits.movement) {
      case squareMovement.XINC:
        x += 1;
        if (x >= limits.upperLimit) {
          limits.movement = squareMovement.ZINC;
        }
        break;
      case squareMovement.ZINC:
        z += 1;
        if (z >= limits.upperLimit) {
          limits.movement = squareMovement.XDEC;
        }
        break;
      case squareMovement.XDEC:
        x -= 1;
        if (x <= limits.lowerLimit) {
          if (z <= (limits.lowerLimit + 1)) {
            limits.movement = squareMovement.XZBUMP;
          }
          else {
            limits.movement = squareMovement.ZDEC;
          }
        }
        break;
      case squareMovement.ZDEC:
        z -= 1;
        if (z <= (limits.lowerLimit + 1)) {
          limits.movement = squareMovement.XZBUMP;
        }
        break;
      case squareMovement.XZBUMP:
        limits.lowerLimit -= 1;
        limits.upperLimit += 1;
        x = z = limits.lowerLimit;
        limits.movement = squareMovement.XINC;
      }

    return [x, z];
  }

}

export { ModelLoader };
