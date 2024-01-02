import * as React from "react"
import FormCategories from "./FormCategories"
import FormList from "./FormList"

interface Props {
    forms: Array<{ name: string, category: string, url: string }>,
    category: string,
    setCategory: React.Dispatch<React.SetStateAction<string>>
}

export default function FormSelect(props: Props) {

    return (
        <React.Fragment>
            <FormCategories
                category={props.category}
                setCategory={props.setCategory}
                forms={props.forms}
            />
            <FormList
                category={props.category}
                forms={props.forms}
            />
        </React.Fragment>
    )
}