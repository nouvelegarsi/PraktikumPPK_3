import { prisma } from "../../../../lib/prisma";
import { comparePassword } from "../../../../lib/auth/password";
import { createSession } from "../../../../lib/auth/session";
import { cookies } from "next/headers";


export async function POST(req:Request){

    const body = await req.json();


    const {
        email,
        password
    } = body;



    const user =
        await prisma.user.findUnique({
            where:{
                email
            }
        });



    if(!user){

        return Response.json({
            message:"Email atau password salah"
        },{
            status:401
        });

    }



    const valid =
        await comparePassword(
            password,
            user.passwordHash
        );



    if(!valid){

        return Response.json({
            message:"Email atau password salah"
        },{
            status:401
        });

    }



    const session =
        await createSession(user.id);



    const cookieStore = await cookies();


    cookieStore.set(
        "session_id",
        session.sessionId,
        {
            httpOnly:true,
            secure:false,
            sameSite:"lax",
            maxAge:60*60*24*7,
            path:"/"
        }
    );



    return Response.json({
        message:"Login berhasil"
    });

}