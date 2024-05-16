import { Page, View, Text, Image, Document, Svg, Line, Polyline, StyleSheet, renderToStream } from "@react-pdf/renderer"
import { OrderRow, PartsReq } from "../models/partsReq"

interface PartsReqPDF {
    partsReq: PartsReq,
    pricing: boolean
}

interface HeaderRowProps {
    pricing: boolean
}

interface TableRowProps {
    row: OrderRow,
    pricing: boolean
}

interface TotalRowProps {
    rows: Array<OrderRow>
}

function calcCost(parts: Array<OrderRow>) {
    let sum = 0

    for (const part of parts) {
        sum += Number(part.cost) * part.qty
    }

    return sum
}

// Styles for PDF
const pdfStyles = StyleSheet.create({
    body: {
        paddingTop: 35,
        paddingBottom: 35,
        paddingHorizontal: 35,
        flexDirection: "column"
    },
    infoContainer: {
        flexDirection: "row",
        marginTop: 15
    },
    infoColumn: {
        width: "50%",
        marginRight: 15,
        flexDirection: "column"
    },
    infoSection: {
        flexDirection: "column",
        marginBottom: 20
    },
    checkboxRow: {
        flexDirection: "row",
        marginBottom: 5
    },
    infoRow: {
        flexDirection: "row",
        marginBottom: 5
    },
    tableContainer: {
        flexDirection: "column",
        width: "100%"
    },
    headerRow: {
        flexDirection: "row"
    },
    fieldTitle: {
        fontSize: 12,
        textAlign: "left",
        fontFamily: "Helvetica-Bold",
        width: "50%"
    },
    fieldValue: {
        fontSize: 12,
        textAlign: "left",
        fontFamily: "Helvetica",
        width: "50%"
    },
    checkboxText: {
        fontSize: 12,
        fontFamily: "Helvetica",
        marginLeft: 5
    },
    sectionText: {
        fontSize: 12,
        fontFamily: "Helvetica-Bold",
        marginTop: 5
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        fontFamily: 'Helvetica'
    },
    dateText: {
        fontSize: 10,
        textAlign: "center",
        fontFamily: "Helvetica",
        color: "grey",
        marginTop: 5
    },
    text: {
        margin: 12,
        fontSize: 12,
        textAlign: 'left',
        fontFamily: 'Helvetica',
        width: "100%"
    },
    topImage: {
        marginHorizontal: 200,
        top: -10,
        textAlign: 'center',
    },
    footerNumber: {
        position: 'absolute',
        fontSize: 12,
        bottom: 10,
        left: 0,
        right: 35,
        textAlign: 'right',
        color: 'grey',
    },
    lineBreak: {
        marginBottom: 5
    }
});

function LineBreak() {
    return (
        <Svg height="5" width="250" style={pdfStyles.lineBreak}>
            <Line x1="0" y1="2" x2="250" y2="2" strokeWidth={1} stroke="rgb(169, 169, 169)" />
        </Svg>
    )
}

function FullLine() {
    return (
        <Svg height="5" width="520" style={{ marginTop: 5, marginBottom: 5 }}>
            <Line x1="0" y1="2" x2="520" y2="2" strokeWidth={1} stroke="rgb(169, 169, 169)" />
        </Svg>
    )
}

function EmptyCheckbox() {
    return (
        <Svg height="15" width="15">
            <Polyline
                points="0,0 0,15 15,15 15,0 0,0"
                stroke="black"
                strokeWidth={1}
            />
        </Svg>
    )
}

function CheckedCheckbox() {
    return (
        <Svg height="15" width="15">
            <Polyline
                points="0,0 0,15 15,15 15,0 0,0 15,15 0,15 15,0"
                stroke="black"
                strokeWidth={1}
            />
        </Svg>
    )
}

function HeaderRow(props: HeaderRowProps) {
    const { pricing } = props

    return (
        <>
            <View style={pdfStyles.headerRow}>
                <Text style={[pdfStyles.fieldTitle, { width: "7%" }]}>
                    Qty
                </Text>
                <Text style={[pdfStyles.fieldTitle, { width: pricing ? "25%" : "28%" }]}>
                    Part #
                </Text>
                <Text style={[pdfStyles.fieldTitle, { width: pricing ? "40%" : "65%" }]}>
                    Description
                </Text>
                {pricing &&
                    <Text style={[pdfStyles.fieldTitle, { width: "13%" }]}>
                        Rate
                    </Text>
                }
                {pricing &&
                    <Text style={[pdfStyles.fieldTitle, { width: "15%" }]}>
                        Amount
                    </Text>
                }
            </View>
            <FullLine />
        </>
    )
}

function TableRow(props: TableRowProps) {
    const { row, pricing } = props

    return (
        <>
            <View style={pdfStyles.headerRow}>
                <Text style={[pdfStyles.fieldValue, { width: "7%", marginRight: "3px" }]}>
                    {row.qty}
                </Text>
                <Text style={[pdfStyles.fieldValue, { width: pricing ? "25%" : "28%", marginRight: "3px" }]}>
                    {row.itemNumber}
                </Text>
                <Text style={[pdfStyles.fieldValue, { width: pricing ? "40%" : "65%", marginRight: "3px" }]}>
                    {row.description}
                </Text>
                {pricing &&
                    <Text style={[pdfStyles.fieldValue, { width: "13%", marginRight: "3px" }]}>
                        {row.cost ? `$${Number(row.cost).toFixed(2)}` : null}
                    </Text>
                }
                {pricing &&
                    <Text style={[pdfStyles.fieldValue, { width: "15%", marginRight: "3px" }]}>
                        {row.cost ? `$${(row.qty * Number(row.cost)).toFixed(2)}` : null}
                    </Text>
                }
            </View>
            <FullLine />
        </>
    )
}

function TotalRow(props: TotalRowProps) {
    const { rows } = props

    return (
        <>
            <View style={pdfStyles.headerRow}>
                <Text style={[pdfStyles.fieldTitle, { width: "7%" }]}>

                </Text>
                <Text style={[pdfStyles.fieldTitle, { width: "25%" }]}>

                </Text>
                <Text style={[pdfStyles.fieldTitle, { width: "40%" }]}>

                </Text>
                <Text style={[pdfStyles.fieldTitle, { width: "13%" }]}>

                </Text>
                <Text style={[pdfStyles.fieldTitle, { width: "15%" }]}>
                    ${calcCost(rows).toFixed(2)}
                </Text>
            </View>
        </>
    )
}

// React Component for generating PDF of PartsReq
function PartsReqPDF(props: PartsReqPDF) {
    const { partsReq, pricing } = props

    return (
        <Document>
            <Page style={pdfStyles.body}>
                <View>
                    <Image
                        style={pdfStyles.topImage}
                        src={"https://res.cloudinary.com/dvdturlak/image/upload/v1711569129/nova-dark_r4jk7x.png"}
                    />
                    <Text style={pdfStyles.title}>
                        Parts Requisition #{partsReq.id}
                    </Text>
                    <Text style={pdfStyles.dateText}>
                        {new Date().toLocaleDateString()}
                    </Text>
                </View>
                <View style={pdfStyles.infoContainer}>
                    <View style={pdfStyles.infoColumn}>
                        <View style={pdfStyles.infoSection}>
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    Status:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.status}
                                </Text>
                            </View>
                        </View>
                        <View style={pdfStyles.infoSection}>
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    Parts Requester:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {`${partsReq.requester.firstName} ${partsReq.requester.lastName}`}
                                </Text>
                            </View>
                            {partsReq.contact && <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    Supply Chain Contact:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {`${partsReq.contact.firstName} ${partsReq.contact.lastName}`}
                                </Text>
                            </View>}
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    Order Date:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.date.toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={pdfStyles.checkboxRow}>
                                {partsReq.billable ? <CheckedCheckbox /> : <EmptyCheckbox />}
                                <Text
                                    style={pdfStyles.checkboxText}
                                >
                                    Billable to Customer for Nova Unit?
                                </Text>
                            </View>
                            <View style={pdfStyles.checkboxRow}>
                                {partsReq.amex ? <CheckedCheckbox /> : <EmptyCheckbox />}
                                <Text
                                    style={pdfStyles.checkboxText}
                                >
                                    Is this an Amex Request?
                                </Text>
                            </View>
                            {partsReq.amex && <View style={pdfStyles.infoRow}>
                                <Text style={pdfStyles.fieldTitle}>
                                    Vendor:
                                </Text>
                                <Text style={pdfStyles.fieldValue}>
                                    {partsReq.vendor?.name}
                                </Text>
                            </View>}
                            <View style={pdfStyles.checkboxRow}>
                                {partsReq.conex ? <CheckedCheckbox /> : <EmptyCheckbox />}
                                <Text
                                    style={pdfStyles.checkboxText}
                                >
                                    All parts taken from Conex?
                                </Text>
                            </View>
                            {partsReq.conex && <View style={pdfStyles.infoRow}>
                                <Text style={pdfStyles.fieldTitle}>
                                    Conex:
                                </Text>
                                <Text style={pdfStyles.fieldValue}>
                                    {partsReq.conexName ? partsReq.conexName.name : ""}
                                </Text>
                            </View>}
                            {(partsReq.afe || partsReq.salesOrder) &&
                                <>
                                    <Text style={pdfStyles.sectionText}>
                                        Class
                                    </Text>
                                    <LineBreak />
                                </>}
                            {partsReq.afe && <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    AFE #:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.afe.number}
                                </Text>
                            </View>}
                            {partsReq.salesOrder && <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    SO #:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.salesOrder.number}
                                </Text>
                            </View>}
                            <Text style={pdfStyles.sectionText}>
                                Related Asset
                            </Text>
                            <LineBreak />
                            {partsReq.unit ?
                                <>
                                    <View style={pdfStyles.infoRow}>
                                        <Text
                                            style={pdfStyles.fieldTitle}
                                        >
                                            Unit #:
                                        </Text>
                                        <Text
                                            style={pdfStyles.fieldValue}
                                        >
                                            {partsReq.unit.unitNumber}
                                        </Text>
                                    </View>
                                    <View style={pdfStyles.infoRow}>
                                        <Text
                                            style={pdfStyles.fieldTitle}
                                        >
                                            Location:
                                        </Text>
                                        <Text
                                            style={pdfStyles.fieldValue}
                                        >
                                            {partsReq.unit.location}
                                        </Text>
                                    </View>
                                    <View style={pdfStyles.infoRow}>
                                        <Text
                                            style={pdfStyles.fieldTitle}
                                        >
                                            Customer:
                                        </Text>
                                        <Text
                                            style={pdfStyles.fieldValue}
                                        >
                                            {partsReq.unit.customer}
                                        </Text>
                                    </View>
                                    <View style={pdfStyles.infoRow}>
                                        <Text
                                            style={pdfStyles.fieldTitle}
                                        >
                                            Unit Status:
                                        </Text>
                                        <Text
                                            style={pdfStyles.fieldValue}
                                        >
                                            {partsReq.unit.status}
                                        </Text>
                                    </View>
                                </> :
                                <View style={pdfStyles.infoRow}>
                                    <Text
                                        style={pdfStyles.fieldTitle}
                                    >
                                        Truck #:
                                    </Text>
                                    <Text
                                        style={pdfStyles.fieldValue}
                                    >
                                        {partsReq.truck ? partsReq.truck.name : ""}
                                    </Text>
                                </View>
                            }
                        </View>
                    </View>
                    <View style={pdfStyles.infoColumn}>
                        {partsReq.pickup && <View style={pdfStyles.infoSection}>
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    Pick Up Location:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.pickup.name}
                                </Text>
                            </View>
                        </View>}
                        <View style={pdfStyles.infoSection}>
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    Urgency:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.urgency}
                                </Text>
                            </View>
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    Order Type:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.orderType}
                                </Text>
                            </View>
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    Operational Region:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.region}
                                </Text>
                            </View>
                        </View>
                        {partsReq.unit && <View style={pdfStyles.infoSection}>
                            <Text style={pdfStyles.sectionText}>
                                Engine
                            </Text>
                            <LineBreak />
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    Make & Model:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.unit.engine}
                                </Text>
                            </View>
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    S/N:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.unit.engineSerialNum}
                                </Text>
                            </View>
                            <Text style={pdfStyles.sectionText}>
                                Compressor Frame
                            </Text>
                            <LineBreak />
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    Make:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.unit.compressorFrame}
                                </Text>
                            </View>
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    Model:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.unit.compressorFrameFamily}
                                </Text>
                            </View>
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    S/N:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.unit.compressorFrameSN}
                                </Text>
                            </View>
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    Stages:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.unit.stages}
                                </Text>
                            </View>
                            <View style={pdfStyles.infoRow}>
                                <Text
                                    style={pdfStyles.fieldTitle}
                                >
                                    Cylinder Size:
                                </Text>
                                <Text
                                    style={pdfStyles.fieldValue}
                                >
                                    {partsReq.unit.cylinderSize}
                                </Text>
                            </View>
                        </View>}
                    </View>
                </View>
                <View style={pdfStyles.tableContainer}>
                    <HeaderRow
                        pricing={pricing}
                    />
                    {partsReq.parts.map((row) => {
                        return (
                            <TableRow
                                key={row.id}
                                row={row}
                                pricing={pricing}
                            />
                        )
                    })}
                    {pricing &&
                        <TotalRow
                            rows={partsReq.parts}
                        />
                    }
                </View>
                <Text style={pdfStyles.footerNumber} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        </Document >
    )
}

// Generate PDF of Parts Req
export const generatePartsReqPDF = async (partsReq: PartsReq, pricing: boolean) => {
    const pdf = await renderToStream(
        <PartsReqPDF
            partsReq={partsReq}
            pricing={pricing}
        />
    )

    return pdf
}