import prisma from "$lib/prisma/client";
import prismaAdapter from "@lucia-auth/adapter-prisma";
import lucia from 'lucia-auth';


export const auth = lucia({
  adapter: prismaAdapter(prisma),
  env: "DEV"
});