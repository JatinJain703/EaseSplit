import axios from "axios";
import { GroupAtom } from "../atoms/atom";
import { useSetRecoilState } from "recoil";
export function usegetGroups() {
    const setGroups = useSetRecoilState(GroupAtom);

    async function fetchgroups() {
        try {
            const response = await axios.get("https://easesplit.onrender.com/Groups", {
                headers: {
                    userid: localStorage.getItem("userid")
                },
            });
            setGroups(response.data.groups);
        } catch (err) {
            console.error("Failed to fetch Groups", err);
            setGroups([]);
        }
    }

    return fetchgroups;
}