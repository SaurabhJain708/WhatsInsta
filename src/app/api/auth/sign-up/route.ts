import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest,res:NextResponse){
    const {name,email,phonenumber} = await req.json();
    if(!name || (!email && !phonenumber)){
        
    }
}