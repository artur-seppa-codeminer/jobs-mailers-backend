import { redisConfig } from '../redisConfig.js';
import { taskStatusQueue } from './queue.js';

export async function taskSchedulerUpdateStatus() {
  await taskStatusQueue.upsertJobScheduler(
    'updatetaskStatus',     
    { pattern: '* * * * * *' },
    {
      name: 'updateStatusLateTask',
      data: { status: 'LATE' },
      opts: {
        removeOnComplete: true
      },
    }
  );

  await taskStatusQueue.upsertJobScheduler(
    'updatetaskStatus',     
    { pattern: '* * * * * *' },
    {
      name: 'updateStatusDoneTask',
      data: { status: 'DONE' },
      opts: {
        removeOnComplete: true
      },
    }
  );
}