import * as tf from '@tensorflow/tfjs';

export type BoardState = number[]; // 0 = empty, 1 = X, -1 = O
export type Action = number;

interface Step {
  state: BoardState;
  action: Action;
  reward: number;
  nextState: BoardState;
  done: boolean;
}

export class TicTacToeAgent {
  public model: tf.Sequential;
  private alpha = 1; // learning rate
  private memory: Step[] = [];
  public gameCount = 0;

  constructor() {
    this.model = this.createModel();
    this.loadState();
  }

  private createModel(): tf.Sequential {
    const model = tf.sequential();

    model.add(
      tf.layers.dense({
        inputShape: [9],
        units: 64,
        activation: "relu"
      })
    );
  
    model.add(
      tf.layers.dense({
        units: 64,
        activation: "relu"
      })
    );
  
    model.add(
      tf.layers.dense({
        units: 9,
        activation: "softmax"
      })
    );
    model.compile({ optimizer: tf.train.adam(this.alpha), loss: 'meanSquaredError' });
    return model;
  }

  private async loadState() {
    console.log('weights', this.model.getWeights())
    try {
      const loaded = await tf.loadLayersModel('localstorage://tictactoe-ai');
      this.model.setWeights(loaded.getWeights());
    } catch {
      console.log('No saved model found. Starting fresh.');
    }
    const storedCount = localStorage.getItem('gameCount');
    this.gameCount = storedCount ? parseInt(storedCount, 10) : 0;
  }

  private async saveState() {
    await this.model.save('localstorage://tictactoe-ai');
    localStorage.setItem('gameCount', this.gameCount.toString());
  }

  public async chooseAction(state: BoardState): Promise<Action> {
    const validMoves = this.getEmptyIndices(state);
    const tensor = tf.tensor2d([state], [1, 9]);
    const prediction = this.model.predict(tensor) as tf.Tensor;
    const qValues = await prediction.data();
    console.log('[debug] qValues:', qValues)
    tensor.dispose();
    prediction.dispose();

    const maskedQ = qValues.map((q, i) => validMoves.includes(i) ? q : -Infinity);
    return maskedQ.indexOf(Math.max(...maskedQ));
  }

  /**
   * Observe a step; only train once the game ends (done=true).
   */
  public async observe(step: Step) {
    this.memory.push(step);
    if (step.done) {
      await this.trainFromMemory();
      this.memory = [];
      this.gameCount++;
      await this.saveState();
    }
  }

  private async trainFromMemory() {
    console.log('[debug] memory:', this.memory)
    for (const { state, action, reward } of this.memory) {
      const stateTensor = tf.tensor2d([state], [1, 9]);
      const currentQ = (this.model.predict(stateTensor) as tf.Tensor).dataSync();
      const targetQ = Array.from(currentQ);
      targetQ[action] = reward; // Only immediate reward
  
      await this.model.fit(stateTensor, tf.tensor2d([targetQ], [1, 9]), { epochs: 1, verbose: 0 });
      stateTensor.dispose();
    }
  }

  public reset() {
    this.model = this.createModel();
    this.memory = [];
    this.gameCount = 0;
    localStorage.removeItem('gameCount');
    tf.io.removeModel('localstorage://tictactoe-ai');
  }

  private getEmptyIndices(state: BoardState): number[] {
    return state.map((v, i) => v === 0 ? i : -1).filter(i => i !== -1);
  }
}
