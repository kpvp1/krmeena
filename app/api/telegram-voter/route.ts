import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-webhook-secret");

    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const record = body.record || body;

    // -----------------------------
    // PUBLIC ISSUES
    // -----------------------------
    if (
      record.issue_type !== undefined ||
      record.details !== undefined ||
      record.village !== undefined
    ) {
      const name = record.name || "";
      const mobile = record.mobile || "";
      const village = record.village || "";
      const issueType = record.issue_type || "";
      const details = record.details || "";
      const createdAt =
        record.created_at || new Date().toISOString();

      const dateTime = new Date(createdAt).toLocaleString(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }
      );

      const message = `📢 नई जनसमस्या प्राप्त हुई

👤 नाम: ${name}

📱 मोबाइल: ${mobile}

📍 गाँव: ${village}

📌 समस्या का प्रकार: ${issueType}

📝 विवरण:
${details}

🕐 समय: ${dateTime}`;

      await sendTelegram(message);

      return NextResponse.json({
        success: true,
        type: "public_issue",
      });
    }

    // -----------------------------
    // GIFT CLAIMS
    // -----------------------------
    const name = record.name || "";
    const fatherName = record.father_name || "";
    const mobile = record.mobile || "";
    const createdAt =
      record.created_at || new Date().toISOString();

    const dateTime = new Date(createdAt).toLocaleString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }
    );

    const message = `🗳️ नई Voter Search Entry

👤 नाम: ${name}

👨‍👦 पिता का नाम: ${fatherName}

📱 मोबाइल: ${mobile}

🕐 समय: ${dateTime}`;

    await sendTelegram(message);

    return NextResponse.json({
      success: true,
      type: "gift_claim",
    });

  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}


// ---------------------------------
// TELEGRAM FUNCTION
// ---------------------------------

async function sendTelegram(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    throw new Error(
      "Telegram environment variables missing"
    );
  }

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Telegram error:", data);

    throw new Error(
      `Telegram failed: ${JSON.stringify(data)}`
    );
  }

  return data;
}