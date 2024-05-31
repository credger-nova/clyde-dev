import * as React from "react"
import FormSelect from "../components/forms/FormSelect"
import { Route, Routes } from "react-router-dom"
import PartsReqForm from "../components/forms/NewPartsReqForm"

const FORMS = [{ name: "Parts Requisition", category: "Supply Chain", url: "parts-requisition" }]

export default function Forms() {
    const [category, setCategory] = React.useState<string>("All")

    return (
        <div className="page-container">
            <Routes>
                <Route path="" element={<FormSelect category={category} setCategory={setCategory} forms={FORMS} />} />
                <Route path="new/:form" element={<PartsReqForm />} />
            </Routes>
        </div>
    )
}
