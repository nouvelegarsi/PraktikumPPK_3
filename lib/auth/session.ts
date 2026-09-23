import { prisma } from "../prisma";


export async function createSession(
    userId:number
){

    const session =
        await prisma.session.create({
            data:{
                userId,
                expiresAt:
                new Date(
                    Date.now() + 
                    7 * 24 * 60 * 60 * 1000
                )
            }
        });


    return session;
}