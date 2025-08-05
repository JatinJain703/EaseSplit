import axios from "axios";
import { useState, useEffect } from "react";
import { FriendsAtom } from "../atoms/atom";
import { useSetRecoilState } from "recoil";

export function usegetFriends()
{
    const setFriends=useSetRecoilState(FriendsAtom);

        async function fetchFriends() {
            try {
                const response = await axios.get("https://easesplit.onrender.com/Friends", {
                    headers: {
                        userid: localStorage.getItem("userid")
                    },
                });
                setFriends({
                    AllFriends: response.data.AllFriends,
                    Settled: response.data.Settled,
                    Unsettled: response.data.Unsettled
                })
            } catch (err) {
                console.error("Failed to fetch  Friends", err);
                setFriends({
                    AllFriends: [],
                    Settled: [],
                    Unsettled: []
                })
            }
        }
        return fetchFriends;
}