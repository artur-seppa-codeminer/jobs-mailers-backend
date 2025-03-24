import type { Knex } from "knex";
import BaseModel from "../models/baseModel.js";
import { User, UserRole, UserStatus } from "../models/user.js";

export async function seed(knex: Knex): Promise<void> {
  BaseModel.knex(knex);

  const password = "dunder";

  const usersWithTasks = [
    {
      username: "michael",
      password,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      tasks: [
        {
          title: "Plan a meeting",
          description: "Organize a meeting with the staff for team-building.",
          priority: 2,
          dueDate: getDueDate(0),
        },
        {
          title: "Make a speech",
          description: "Prepare a speech for the next office event.",
          priority: 3,
          dueDate: getDueDate(1),
        },
        {
          title: "Coffee run",
          description: "Get everyone their coffee orders for the morning.",
          priority: 1,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "jim",
      password,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      tasks: [
        {
          title: "Prank Dwight",
          description:
            "Set up a prank to prank Dwight, the more elaborate, the better.",
          priority: 3,
          dueDate: getDueDate(0),
        },
        {
          title: "Date night",
          description: "Set up a date with Pam for a night out.",
          priority: 2,
          dueDate: getDueDate(1),
        },
        {
          title: "Sales call",
          description: "Make an important sales call to a potential client.",
          priority: 2,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "pam",
      password,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      tasks: [
        {
          title: "Art show prep",
          description: "Prepare for the next art show and set up a display.",
          priority: 2,
          dueDate: getDueDate(0),
        },
        {
          title: "Wedding planning",
          description: "Help with the wedding preparations for Jim and Pam.",
          priority: 1,
          dueDate: getDueDate(1),
        },
        {
          title: "Lunchtime order",
          description: "Order lunch for the office.",
          priority: 2,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "dwight",
      password,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      tasks: [
        {
          title: "Beet farm maintenance",
          description: "Inspect and maintain the beet farm.",
          priority: 1,
          dueDate: getDueDate(0),
        },
        {
          title: "Assistant to the Regional Manager",
          description: "Ensure all office operations are running smoothly.",
          priority: 3,
          dueDate: getDueDate(1),
        },
        {
          title: "Survival training",
          description: "Prepare a survival training session for the office.",
          priority: 2,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "angela",
      password,
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
      tasks: [
        {
          title: "Cat care",
          description: "Make sure all the cats are well taken care of.",
          priority: 2,
          dueDate: getDueDate(0),
        },
        {
          title: "Christmas party",
          description: "Organize the office Christmas party decorations.",
          priority: 3,
          dueDate: getDueDate(1),
        },
        {
          title: "Fundraising event",
          description: "Plan the office charity event for the year.",
          priority: 1,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "kevin",
      password,
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
      tasks: [
        {
          title: "Make chili",
          description: "Cook a batch of chili for the office party.",
          priority: 3,
          dueDate: getDueDate(0),
        },
        {
          title: "Finance report",
          description: "Prepare the monthly finance report for the office.",
          priority: 2,
          dueDate: getDueDate(1),
        },
        {
          title: "M&M's restock",
          description: "Restock M&M's in the office pantry.",
          priority: 1,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "stanley",
      password,
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
      tasks: [
        {
          title: "Crossword",
          description: "Finish the daily crossword puzzle.",
          priority: 0,
          dueDate: getDueDate(0),
        },
        {
          title: "PTO request",
          description: "Submit a request for some well-deserved PTO.",
          priority: 1,
          dueDate: getDueDate(1),
        },
        {
          title: "Sales goal",
          description: "Meet your sales goal for the quarter.",
          priority: 2,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "oscar",
      password,
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
      tasks: [
        {
          title: "Budget review",
          description: "Review the monthly budget and report to management.",
          priority: 3,
          dueDate: getDueDate(0),
        },
        {
          title: "Client meeting",
          description:
            "Attend a meeting with a major client about financial strategies.",
          priority: 2,
          dueDate: getDueDate(1),
        },
        {
          title: "Tax filing",
          description: "Ensure all office taxes are filed on time.",
          priority: 1,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "toby",
      password,
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
      tasks: [
        {
          title: "HR report",
          description: "Prepare the HR report for the next board meeting.",
          priority: 2,
          dueDate: getDueDate(0),
        },
        {
          title: "Employee feedback",
          description:
            "Collect feedback from employees about the office environment.",
          priority: 1,
          dueDate: getDueDate(1),
        },
        {
          title: "Conflict resolution",
          description: "Resolve the latest office dispute.",
          priority: 3,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "andy",
      password,
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
      tasks: [
        {
          title: "Cornell reunion",
          description: "Organize the next Cornell alumni reunion.",
          priority: 1,
          dueDate: getDueDate(0),
        },
        {
          title: "Sales pitch",
          description: "Prepare for an important sales pitch with a client.",
          priority: 2,
          dueDate: getDueDate(1),
        },
        {
          title: "Lawn care",
          description: "Mow the lawn and clean up the garden.",
          priority: 0,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "meredith",
      password,
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
      tasks: [
        {
          title: "Office party",
          description: "Plan the next office party and get drinks.",
          priority: 2,
          dueDate: getDueDate(0),
        },
        {
          title: "Medical check-up",
          description: "Get your routine medical check-up.",
          priority: 1,
          dueDate: getDueDate(1),
        },
        {
          title: "Vacation request",
          description: "Submit your vacation request form.",
          priority: 3,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "ryan",
      password,
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
      tasks: [
        {
          title: "Website update",
          description: "Fix the website and make it more user-friendly.",
          priority: 2,
          dueDate: getDueDate(0),
        },
        {
          title: "Project management",
          description: "Lead the next project and ensure deadlines are met.",
          priority: 3,
          dueDate: getDueDate(1),
        },
        {
          title: "Client call",
          description: "Follow up with a key client to discuss progress.",
          priority: 1,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "kelly",
      password,
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
      tasks: [
        {
          title: "Customer service",
          description:
            "Handle the latest customer complaints with grace and enthusiasm.",
          priority: 2,
          dueDate: getDueDate(0),
        },
        {
          title: "Office gossip",
          description: "Keep track of the latest office gossip and updates.",
          priority: 0,
          dueDate: getDueDate(1),
        },
        {
          title: "Relationship talk",
          description:
            "Have a one-on-one chat with Ryan about your relationship.",
          priority: 1,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "creed",
      password,
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
      tasks: [
        {
          title: "Mysterious task",
          description: "Handle the mysterious task no one knows about.",
          priority: 1,
          dueDate: getDueDate(0),
        },
        {
          title: "Document shredding",
          description: "Shred all the documents no one needs anymore.",
          priority: 0,
          dueDate: getDueDate(1),
        },
        {
          title: "Track down an old friend",
          description: "Locate an old friend and re-establish contact.",
          priority: 2,
          dueDate: getDueDate(2),
        },
      ],
    },
    {
      username: "phyllis",
      password,
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
      tasks: [
        {
          title: "Team lunch",
          description: "Organize a team lunch for the office.",
          priority: 2,
          dueDate: getDueDate(0),
        },
        {
          title: "Seasonal decorations",
          description:
            "Get the office ready for the next seasonal decorations.",
          priority: 1,
          dueDate: getDueDate(1),
        },
        {
          title: "Sales report",
          description: "Complete the sales report for the end of the quarter.",
          priority: 3,
          dueDate: getDueDate(2),
        },
      ],
    },
  ];

  await Promise.all(
    usersWithTasks.map(async (userWithTasks) => {
      const { tasks, ...user } = userWithTasks;

      const createdUser = await User.query().insertAndFetch(user);

      await createdUser
        .$relatedQuery("tasks")
        .insert(tasks.map((task) => ({ ...task, ownerId: createdUser.id })));
    }),
  );
}

function getDueDate(daysFromNow: number) {
  return new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
}
