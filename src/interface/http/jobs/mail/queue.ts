import { redisConfig } from '../redisConfig.js'
import { Queue } from 'bullmq';

export const taskStatusQueue = new Queue('taskStatusQueue', {...redisConfig, defaultJobOptions: {
    removeOnFail: true,
    removeOnComplete: true,
}});

export async function addTaskStatusJob(status: string) {
    await taskStatusQueue.add(
        'updatetaskStatus',
        { status }
    );
}