import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";


export async function POST(req:Request){

    try{

        const body = await req.json();

        const {
            nama,
            email,
            password
        } = body;


        if(!nama || !email || !password){
            return Response.json(
                {
                    message:"Semua field wajib diisi"
                },
                {
                    status:400
                }
            );
        }


        if(password.length < 8){
            return Response.json(
                {
                    message:"Password minimal 8 karakter"
                },
                {
                    status:400
                }
            );
        }


        const existingUser =
            await prisma.user.findUnique({
                where:{
                    email
                }
            });


        if(existingUser){
            return Response.json(
                {
                    message:"Email sudah digunakan"
                },
                {
                    status:400
                }
            );
        }


        const passwordHash =
            await hashPassword(password);



        await prisma.user.create({
            data:{
                nama,
                email,
                passwordHash
            }
        });


        return Response.json({
            message:"Register berhasil"
        });


    }catch(error){

        return Response.json(
            {
                message:"Terjadi error"
            },
            {
                status:500
            }
        );
    }

}