import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createPersistedOrder, getAdminMetrics, listCatalogProducts, listCustomerOrders, listRecentOrders, updateOrderStatus } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  catalog: router({
    list: publicProcedure.query(() => listCatalogProducts()),
  }),
  orders: router({
    create: protectedProcedure.input(z.object({
      customerName: z.string().trim().min(3).max(160),
      phone: z.string().regex(/^03\d{9}$/),
      address: z.string().trim().min(8).max(2000),
      city: z.string().trim().min(2).max(80),
      postalCode: z.string().trim().min(4).max(16),
      couponCode: z.string().trim().max(40).optional(),
      items: z.array(z.object({ productSlug: z.string().min(1).max(160), quantity: z.number().int().min(1).max(20), size: z.string().max(40).optional(), color: z.string().max(50).optional() })).min(1).max(30),
    })).mutation(async ({ input, ctx }) => {
      try {
        return await createPersistedOrder({ ...input, userId: ctx.user.id });
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Unable to place your order." });
      }
    }),
    mine: protectedProcedure.query(({ ctx }) => listCustomerOrders(ctx.user.id)),
  }),
  admin: router({
    metrics: adminProcedure.query(() => getAdminMetrics()),
    orders: adminProcedure.query(() => listRecentOrders()),
    updateOrderStatus: adminProcedure.input(z.object({ orderId: z.number().int().positive(), status: z.enum(["confirmed", "processing", "shipped", "delivered", "cancelled"]) })).mutation(({ input }) => updateOrderStatus(input.orderId, input.status)),
  }),
});
export type AppRouter = typeof appRouter;
