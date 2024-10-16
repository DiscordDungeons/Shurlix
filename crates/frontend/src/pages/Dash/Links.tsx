import { RequireLogin } from "../../components/HoC/RequireLogin"
import { Dashboard } from "../../components/Layout/Dashboard/Dashboard"

const InternalLinkList = () => {
	return (
		<Dashboard>
			Hello World
		</Dashboard>
	)
}

export const LinkList = RequireLogin(InternalLinkList)