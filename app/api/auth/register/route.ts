import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { pastorsDb } from "@/lib/pastorStore";
import { AUTH_COOKIE, signSession } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, pastor, refCode } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    const user = db.create({ name, email, password });

    // Link the new member to a pastor if a valid approved pastor name was given.
    if (pastor && typeof pastor === "string" && pastor.trim()) {
      const p = pastorsDb.findApprovedByName(pastor);
      if (p) {
        db.update(user.id, {
          referredBy: p.id,
          pastorName: p.name,
          pastorShareRate: p.shareRate,
        });
        pastorsDb.addReferral(p.id, name);
      }
    }

    // Member referral program: link via invite code if provided.
    if (refCode && typeof refCode === "string" && refCode.trim()) {
      const referrer = db.findByReferralCode(refCode.trim());
      if (referrer && referrer.id !== user.id) {
        db.linkMemberReferral(user.id, referrer.id, name);
      }
    }

    // Generate verification token
    const verifyToken = require("crypto").randomBytes(32).toString("hex");

    // Update user with verification token (correct 2-arg signature)
    db.update(user.id, { 
      verifyToken,
      emailVerified: false 
    });

    // Send verification email (Dev Mode logs to console)
    const verifyLink = sendVerificationEmail(email, verifyToken);

    return NextResponse.json({ 
      success: true, 
      verifyLink, // Return for Dev Mode UI display
      message: "Account created. Please verify your email to continue." 
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Registration failed." }, { status: 400 });
  }
}
