export async function GET(request) {
    const data = [
        { id: 1, name: "User A", activity: "ปีใหม่ 2025" },
        { id: 2, name: "User B", activity: "จับของขวัญ" },
    ];

    return Response.json(data);
    }

export async function POST(request) {
    const body = await request.json();
    console.log("รับข้อมูล:", body);

    return Response.json({ message: "บันทึกรายงานเรียบร้อย!" });
}
