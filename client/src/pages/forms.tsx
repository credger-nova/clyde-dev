import * as React from "react"
import FormCategories from "../components/forms/FormCategories"
import FormList from "../components/forms/FormList"

const FORMS = [
    { name: "Parts Requisition", category: "Supply Chain", url: "parts-requisition" }
]


export default function Forms() {
    const [category, setCategory] = React.useState<string>("All")

    return (
        <div className="page-container">
            <FormCategories
                category={category}
                setCategory={setCategory}
                forms={FORMS}
            />
            <FormList
                category={category}
                forms={FORMS}
            />
        </div>
    )
}