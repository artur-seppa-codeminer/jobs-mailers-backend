import { redisConfig } from '../redisConfig.js'
import { Worker } from 'bullmq';
import { FastifyInstance } from 'fastify';
import { updateStatusTask } from "../../../../application/useCases/updateTask.js";

export const createTaskWorker = (server: FastifyInstance) => {
    const taskWorker = new Worker('taskStatusQueue',
        async (job) => {
            try {
                const status = job.data.status;
                const tasks = await updateStatusTask({ status })

                server.log.info("Tasks obtained:", { tasks });

                // if (!tasks.success) {
                //     throw new Error(tasks.error.message || 'Failed to update tasks');
                // }

                return tasks;
            } catch (error) {
                server.log.error(`Job ${job.id} failed:`, error);
                throw error;
            }
        },
        redisConfig
    );

    taskWorker.on('completed', job => {
        server.log.info(`Job ${job.id} completed successfully`);
    });

    taskWorker.on('failed', (job, err) => {
        if (job) {
            server.log.error(`Job ${job.id} failed:`, err);
        } else {
            server.log.error('Worker failed without job:', err);
        }
    });

    return taskWorker;
}