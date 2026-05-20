import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://scholaid.co")
.split(",")
.map((o) => o.trim())
.filter(Boolean);

export function middleware(request: NextRequest) {
const origin = request.headers.get("origin") ?? "";
const isAllowed = allowedOrigins.includes(origin);

// Handle preflight
if (request.method === "OPTIONS") {
return new NextResponse(null, {
status: 204,
headers: corsHeaders(origin, isAllowed),
});
}

const response = NextResponse.next();
for (const [key, value] of Object.entries(corsHeaders(origin, isAllowed))) {
response.headers.set(key, value);
}
return response;
}

function corsHeaders(origin: string, isAllowed: boolean) {
return {
"Access-Control-Allow-Origin": isAllowed ? origin : "",
"Access-Control-Allow-Credentials": "true",
"Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
"Access-Control-Allow-Headers": "Content-Type,Authorization",
};
}

export const config = {
matcher: "/api/:path\*",
};
