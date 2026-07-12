import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    githubInstallationId: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index('by_email', ['email'])
    .index('by_installation', ['githubInstallationId']),
})
