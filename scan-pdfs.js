const fs = require("fs");
const path = require("path");

async function main() {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    const folder = path.join(__dirname, "public");

    const pdfFiles = fs.readdirSync(folder)
        .filter(file => file.toLowerCase().endsWith(".pdf"));

    if (pdfFiles.length === 0) {
        console.log("❌ कोई PDF नहीं मिली।");
        return;
    }

    console.log(`📚 Total PDF मिली: ${pdfFiles.length}`);
    console.log("");

    const index = [];

    const epicRegex = /\b[A-Z]{3}\d{7}\b/gi;

    for (const file of pdfFiles) {

        const pdfPath = path.join(folder, file);

        console.log(`📄 Reading: ${file}`);

        const data = new Uint8Array(
            fs.readFileSync(pdfPath)
        );

        const pdf = await pdfjsLib.getDocument({ data }).promise;

        console.log(`   Pages: ${pdf.numPages}`);

        for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {

            const page = await pdf.getPage(pageNo);

            const content = await page.getTextContent();

            const viewport = page.getViewport({
                scale: 1
            });

            const items = content.items;

            for (const item of items) {

                if (!item.str) continue;

                const matches = [
                    ...item.str.matchAll(epicRegex)
                ];

                for (const match of matches) {

                    const epic = match[0].toUpperCase();

                    const transform = item.transform;

                    const x = transform[4];
                    const y = transform[5];

                    const width = item.width || 0;
                    const height = item.height || 10;

                    index.push({

                        epic: epic,

                        pdf: file,

                        page: pageNo,

                        // PDF page size
                        pageWidth: viewport.width,
                        pageHeight: viewport.height,

                        // EPIC position
                        epicX: x,
                        epicY: y,

                        epicWidth: width,
                        epicHeight: height
                    });
                }
            }
        }

        console.log("   ✅ Done");
        console.log("");
    }

    const unique = new Map();

    for (const item of index) {

        if (!unique.has(item.epic)) {
            unique.set(item.epic, item);
        }
    }

    const result = Array.from(unique.values());

    const outputPath = path.join(
        folder,
        "voter-index.json"
    );

    fs.writeFileSync(
        outputPath,
        JSON.stringify(result, null, 2),
        "utf8"
    );

    console.log("--------------------------------");
    console.log("✅ INDEX COMPLETE");
    console.log("--------------------------------");

    console.log(`PDF files: ${pdfFiles.length}`);
    console.log(`EPIC records: ${result.length}`);

    console.log("");
    console.log("Created:");
    console.log("📄 voter-index.json");
}

main().catch(error => {

    console.error("");
    console.error("❌ ERROR");
    console.error(error);

});