import BaseModel from "./baseModel.js";

export class TaskShare extends BaseModel {
  static tableName = "task_shares";

  id!: number;
  taskId!: number;
  sharedById!: number;
  sharedWithId!: number;
  sharedAt!: Date;

  static get jsonSchema() {
    return {
      type: "object",
      required: ["taskId", "sharedById", "sharedWithId", "sharedAt"],
      properties: {
        id: { type: "integer" },
        taskId: { type: "integer" },
        sharedById: { type: "integer" },
        sharedWithId: { type: "integer" },
        sharedAt: { type: "object" },
      },
    };
  }
}
