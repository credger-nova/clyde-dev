import { useAuth0 } from "@auth0/auth0-react"

export default function Home() {
    const { user } = useAuth0()

    return (
        <div className="page-container">
            <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center" }}>
                <h2>Welcome back, {user?.given_name}</h2>
            </div>
        </div>
    )
}