import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

import {
  PDFDocument,
  rgb,
  StandardFonts
} from "pdf-lib";


// ======================================================
// HINDI TEXT → PNG
// ======================================================

async function createHindiTextImage(
  text: string,
  fontPath: string,
  fontSize: number,
  fontWeight: number = 400,
  textColor = "#000000"
) {

  if (!fs.existsSync(fontPath)) {
    throw new Error(
      `Hindi font नहीं मिला: ${fontPath}`
    );
  }

  const fontBytes =
    fs.readFileSync(fontPath);

  const fontBase64 =
    fontBytes.toString("base64");

  // SVG special characters escape
  const safeText =
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  // थोड़ा extra canvas
  const width = 900;
  const height =
    Math.ceil(fontSize * 2.2);

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
    >

      <style>

        @font-face {
          font-family: "NotoDevanagari";
          src: url(data:font/ttf;base64,${fontBase64})
               format("truetype");
          font-weight: ${fontWeight};
        }

        .text {
          font-family: "NotoDevanagari";
          font-size: ${fontSize}px;
          font-weight: ${fontWeight};
          fill: ${textColor};
        }

      </style>

      <text
        x="450"
        y="${fontSize + 5}"
        text-anchor="middle"
        class="text"
      >
        ${safeText}
      </text>

    </svg>
  `;

  return await sharp(
    Buffer.from(svg)
  )
    .png()
    .toBuffer();
}


// ======================================================
// GET
// ======================================================

export async function GET(
  request: NextRequest
) {

  try {

    const { searchParams } =
      new URL(request.url);


    // ==================================================
    // PARAMETERS
    // ==================================================

    const pdfName =
      searchParams.get("pdf");

    const pageNumber =
      Number(
        searchParams.get("page")
      );

    const epic =
      searchParams
        .get("epic")
        ?.toUpperCase();


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !pdfName ||
      !pageNumber ||
      !epic
    ) {

      return NextResponse.json(
        {
          error:
            "Invalid voter information"
        },
        {
          status: 400
        }
      );

    }


    // ==================================================
    // SAFE PDF NAME
    // ==================================================

    const safeName =
      path.basename(pdfName);


    if (
      !safeName
        .toLowerCase()
        .endsWith(".pdf")
    ) {

      return NextResponse.json(
        {
          error:
            "Invalid PDF file"
        },
        {
          status: 400
        }
      );

    }


    // ==================================================
    // PDF PATH
    // ==================================================

    const pdfPath =
      path.join(
        process.cwd(),
        "public",
        safeName
      );


    if (
      !fs.existsSync(pdfPath)
    ) {

      return NextResponse.json(
        {
          error:
            "PDF file not found"
        },
        {
          status: 404
        }
      );

    }


    // ==================================================
    // VOTER INDEX
    // ==================================================

    const indexPath =
      path.join(
        process.cwd(),
        "public",
        "voter-index.json"
      );


    if (
      !fs.existsSync(indexPath)
    ) {

      return NextResponse.json(
        {
          error:
            "Voter index not found"
        },
        {
          status: 404
        }
      );

    }


    const voterIndex =
      JSON.parse(
        fs.readFileSync(
          indexPath,
          "utf8"
        )
      );


    // ==================================================
    // FIND VOTER
    // ==================================================

    const voter =
      voterIndex.find(
        (v: any) =>
          v.epic?.toUpperCase() === epic &&
          v.pdf === safeName &&
          Number(v.page) === pageNumber
      );


    if (!voter) {

      return NextResponse.json(
        {
          error:
            "Voter record not found"
        },
        {
          status: 404
        }
      );

    }


    // ==================================================
    // SOURCE PDF
    // ==================================================

    const sourceBytes =
      fs.readFileSync(
        pdfPath
      );


    const sourcePdf =
      await PDFDocument.load(
        sourceBytes
      );


    // ==================================================
    // PAGE VALIDATION
    // ==================================================

    if (
      pageNumber < 1 ||
      pageNumber >
        sourcePdf.getPageCount()
    ) {

      return NextResponse.json(
        {
          error:
            "Invalid page number"
        },
        {
          status: 400
        }
      );

    }


    const sourcePage =
      sourcePdf.getPage(
        pageNumber - 1
      );


    // ==================================================
    // PAGE SIZE
    // ==================================================

    const pageWidth =
      Number(
        voter.pageWidth
      );

    const pageHeight =
      Number(
        voter.pageHeight
      );


    // ==================================================
    // EPIC POSITION
    // ==================================================

    const epicX =
      Number(
        voter.epicX
      );

    const epicY =
      Number(
        voter.epicY
      );

    const epicWidth =
      Number(
        voter.epicWidth
      );

    const epicHeight =
      Number(
        voter.epicHeight
      );


    // ==================================================
    // CM
    // ==================================================

    const CM =
      28.3464567;


    // ==================================================
    // CURRENT CROP SETTINGS
    // DO NOT CHANGE
    // ==================================================

    const left =
      Math.max(
        0,
        epicX -
          (1.5 * CM)
      );


    const right =
      Math.min(
        pageWidth,
        epicX +
          epicWidth +
          (2.5 * CM)
      );


    const top =
      Math.min(
        pageHeight,
        epicY +
          epicHeight +
          (0.15 * CM)
      );


    const bottom =
      Math.max(
        0,
        epicY -
          (2.1 * CM)
      );


    const cropWidth =
      right - left;


    const cropHeight =
      top - bottom;


    // ==================================================
    // CROP VALIDATION
    // ==================================================

    if (
      cropWidth <= 0 ||
      cropHeight <= 0
    ) {

      return NextResponse.json(
        {
          error:
            "Invalid crop dimensions"
        },
        {
          status: 400
        }
      );

    }


    // ==================================================
    // CREATE NEW PDF
    // ==================================================

    const newPdf =
      await PDFDocument.create();


    // ==================================================
    // ENGLISH FONT
    // ==================================================

    const helvetica =
      await newPdf.embedFont(
        StandardFonts.Helvetica
      );


    const helveticaBold =
      await newPdf.embedFont(
        StandardFonts.HelveticaBold
      );


    // ==================================================
    // ECI LOGO
    // ==================================================

    const logoPath =
      path.join(
        process.cwd(),
        "public",
        "eci-logo.png"
      );


    if (
      !fs.existsSync(
        logoPath
      )
    ) {

      return NextResponse.json(
        {
          error:
            "ECI logo नहीं मिला। public/eci-logo.png रखें।"
        },
        {
          status: 500
        }
      );

    }


    const logoBytes =
      fs.readFileSync(
        logoPath
      );


    let logoImage;


    try {

      logoImage =
        await newPdf.embedPng(
          logoBytes
        );

    } catch {

      return NextResponse.json(
        {
          error:
            "eci-logo.png वास्तव में PNG format में नहीं है।"
        },
        {
          status: 500
        }
      );

    }


    // ==================================================
    // HINDI FONT
    // ==================================================

    const hindiFontPath =
      path.join(
        process.cwd(),
        "public",
        "NotoSansDevanagari-Regular.ttf"
      );


    const hindiBoldFontPath =
      path.join(
        process.cwd(),
        "public",
        "NotoSansDevanagari-Bold.ttf"
      );


    if (
      !fs.existsSync(
        hindiFontPath
      )
    ) {

      return NextResponse.json(
        {
          error:
            "NotoSansDevanagari-Regular.ttf public folder में नहीं मिली।"
        },
        {
          status: 500
        }
      );

    }


    // ==================================================
    // FINAL PAGE SIZE
    // ==================================================

    const margin = 30;


    // Header थोड़ा बड़ा रखा गया है
    // ताकि logo और Hindi heading के बीच
    // पर्याप्त space मिले।

    const headerHeight =
      135;


    const footerHeight =
      65;


    const finalWidth =
      cropWidth +
      (margin * 2);


    const finalHeight =
      cropHeight +
      headerHeight +
      footerHeight +
      (margin * 2);


    const finalPage =
      newPdf.addPage([
        finalWidth,
        finalHeight
      ]);


    // ==================================================
    // WHITE BACKGROUND
    // ==================================================

    finalPage.drawRectangle({

      x: 0,

      y: 0,

      width:
        finalWidth,

      height:
        finalHeight,

      color:
        rgb(
          1,
          1,
          1
        )

    });


    // ==================================================
    // LOGO
    // ==================================================

    const logoMaxWidth =
      50;

    const logoMaxHeight =
      50;


    const logoScale =
      Math.min(

        logoMaxWidth /
          logoImage.width,

        logoMaxHeight /
          logoImage.height

      );


    const logoWidth =
      logoImage.width *
      logoScale;


    const logoHeight =
      logoImage.height *
      logoScale;


    finalPage.drawImage(
      logoImage,
      {

        x:
          (
            finalWidth -
            logoWidth
          ) / 2,

        // Logo ऊपर
        y:
          finalHeight -
          12 -
          logoHeight,

        width:
          logoWidth,

        height:
          logoHeight

      }
    );


    // ==================================================
    // HINDI HEADER IMAGES
    // ==================================================

    const hindiTitleBytes =
  await createHindiTextImage(
    "भारत निर्वाचन आयोग",
    hindiBoldFontPath,
    46,
    900,
    "#000000"
  );


    const hindiSubtitleBytes =
  await createHindiTextImage(
    "मतदाता सूचना पर्ची",
    hindiBoldFontPath,
    38,
    800,
    "#222222"
  );


    const hindiLocationBytes =
  await createHindiTextImage(
    "ग्राम पंचायत बासनी जोजावर",
    hindiBoldFontPath,
    32,
    800,
    "#000000"
  );


    // ==================================================
    // EMBED HINDI HEADER IMAGES
    // ==================================================

    const hindiTitleImage =
      await newPdf.embedPng(
        hindiTitleBytes
      );


    const hindiSubtitleImage =
      await newPdf.embedPng(
        hindiSubtitleBytes
      );


    const hindiLocationImage =
      await newPdf.embedPng(
        hindiLocationBytes
      );


    // ==================================================
    // HEADER IMAGE SIZES
    // ==================================================

    const titleWidth =
      Math.min(
        finalWidth - 60,
        hindiTitleImage.width
      );


    const titleScale =
      titleWidth /
      hindiTitleImage.width;


    const titleHeight =
      hindiTitleImage.height *
      titleScale;


    const subtitleWidth =
      Math.min(
        finalWidth - 80,
        hindiSubtitleImage.width
      );


    const subtitleScale =
      subtitleWidth /
      hindiSubtitleImage.width;


    const subtitleHeight =
      hindiSubtitleImage.height *
      subtitleScale;


    const locationWidth =
      Math.min(
        finalWidth - 100,
        hindiLocationImage.width
      );


    const locationScale =
      locationWidth /
      hindiLocationImage.width;


    const locationHeight =
      hindiLocationImage.height *
      locationScale;


    // ==================================================
    // DRAW HINDI TITLE
    // ==================================================

    finalPage.drawImage(
      hindiTitleImage,
      {

        x:
          (
            finalWidth -
            titleWidth
          ) / 2,

        y:
          finalHeight -
          headerHeight +
          48,

        width:
          titleWidth,

        height:
          titleHeight

      }
    );


    // ==================================================
    // DRAW SUBTITLE
    // ==================================================

    finalPage.drawImage(
      hindiSubtitleImage,
      {

        x:
          (
            finalWidth -
            subtitleWidth
          ) / 2,

        y:
          finalHeight -
          headerHeight +
          27,

        width:
          subtitleWidth,

        height:
          subtitleHeight

      }
    );


    // ==================================================
    // DRAW LOCATION
    // ==================================================

    finalPage.drawImage(
      hindiLocationImage,
      {

        x:
          (
            finalWidth -
            locationWidth
          ) / 2,

        y:
          finalHeight -
          headerHeight +
          8,

        width:
          locationWidth,

        height:
          locationHeight

      }
    );


    // ==================================================
    // CROPPED VOTER PAGE
    // ==================================================

    const embeddedPage =
      await newPdf.embedPage(
        sourcePage,
        {
          left,
          bottom,
          right,
          top
        }
      );


    const voterX =
      margin;


    const voterY =
      footerHeight +
      margin;


    // ==================================================
    // BORDER
    // ==================================================

    finalPage.drawRectangle({

      x:
        voterX - 2,

      y:
        voterY - 2,

      width:
        cropWidth + 4,

      height:
        cropHeight + 4,

      borderColor:
        rgb(
          0.75,
          0.75,
          0.75
        ),

      borderWidth:
        1

    });


    // ==================================================
    // DRAW VOTER RECORD
    // ==================================================

    finalPage.drawPage(
      embeddedPage,
      {

        x:
          voterX,

        y:
          voterY,

        width:
          cropWidth,

        height:
          cropHeight

      }
    );


    // ==================================================
    // FOOTER HINDI
    // ==================================================

    const footerHindiBytes =
  await createHindiTextImage(
    "लोकतंत्र में आपका एक-एक वोट महत्वपूर्ण है। कृपया मतदान करें।",
    hindiBoldFontPath,
    25,
    700,
    "#222222"
  );


    const footerHindiImage =
      await newPdf.embedPng(
        footerHindiBytes
      );


    const footerMaxWidth =
      finalWidth - 40;


    const footerScale =
      Math.min(
        footerMaxWidth /
          footerHindiImage.width,
        1
      );


    const footerWidth =
      footerHindiImage.width *
      footerScale;


    const footerHeightImage =
      footerHindiImage.height *
      footerScale;


    finalPage.drawImage(
      footerHindiImage,
      {

        x:
          (
            finalWidth -
            footerWidth
          ) / 2,

        y:
          20,

        width:
          footerWidth,

        height:
          footerHeightImage

      }
    );


    // ==================================================
    // SAVE PDF
    // ==================================================

    const outputBytes =
      await newPdf.save();


    // ==================================================
    // RESPONSE
    // ==================================================

    return new NextResponse(
      Buffer.from(
        outputBytes
      ),
      {

        status: 200,

        headers: {

          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="Voter-Slip-${epic}.pdf"`,

          "Cache-Control":
            "no-store"

        }

      }
    );


  } catch (
    error: any
  ) {

    console.error(
      "VOTER SLIP ERROR:",
      error
    );


    return NextResponse.json(
      {

        error:
          error?.message ||
          String(error),

        stack:
          error?.stack ||
          null

      },
      {

        status: 500

      }
    );

  }

}