import * as d from '../declarations';
import { BUILD } from '@build-conditionals';
import { consoleError } from './client-log';
import { plt } from './client-window';


const queueDomReads: d.RafCallback[] = [];
const queueDomWrites: d.RafCallback[] = [];
const queueDomWritesLow: d.RafCallback[] = [];


const queueTask = (queue: d.RafCallback[]) => (cb: d.RafCallback) => {
  // queue dom reads
  queue.push(cb);

  if (!plt.$queuePending$) {
    plt.$queuePending$ = true;

    requestAnimationFrame(flush);
  }
};


const consume = (queue: d.RafCallback[]) => {
  for (let i = 0; i < queue.length; i++) {
    try {
      queue[i](performance.now());
    } catch (e) {
      consoleError(e);
    }
  }
  queue.length = 0;
};


const consumeTimeout = (queue: d.RafCallback[], timeout: number) => {
  let i = 0;
  let ts: number;
  while (i < queue.length && (ts = performance.now()) < timeout) {
    try {
      queue[i++](ts);
    } catch (e) {
      consoleError(e);
    }
  }
  if (i === queue.length) {
    queue.length = 0;
  } else if (i !== 0) {
    queue.splice(0, i);
  }
};


const flush = () => {
  plt.$queueCongestion$++;

  // always force a bunch of medium callbacks to run, but still have
  // a throttle on how many can run in a certain time

  // DOM READS!!!
  consume(queueDomReads);

  const timeout = performance.now() + (7 * Math.ceil(plt.$queueCongestion$ * (1.0 / 22.0)));

  // DOM WRITES!!!
  consumeTimeout(queueDomWrites, timeout);
  consumeTimeout(queueDomWritesLow, timeout);

  if (queueDomWrites.length > 0) {
    queueDomWritesLow.push(...queueDomWrites);
    queueDomWrites.length = 0;
  }

  if (plt.$queuePending$ = ((queueDomReads.length + queueDomWrites.length + queueDomWritesLow.length) > 0)) {
    // still more to do yet, but we've run out of time
    // let's let this thing cool off and try again in the next tick
    requestAnimationFrame(flush);

  } else {
    plt.$queueCongestion$ = 0;
  }
};

export const tick = (BUILD.taskQueue ? Promise.resolve() : undefined);

export const readTask = (BUILD.taskQueue) ? queueTask(queueDomReads) : undefined;

export const writeTask = (BUILD.taskQueue) ? queueTask(queueDomWrites) : undefined;