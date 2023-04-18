import Layout from "../components/layout";
import Post, {IPost} from "../models/post";
import React, {useEffect} from "react";
import PostTile from "../components/posts/PostTile";
import PostTileContainer from "../components/posts/PostTileContainer";
import useSWR from "swr";
import fetcher from "../lib/fetch";
import {useSession} from "next-auth/react";
import PostTileSkeleton from "../components/posts/PostTileSkeleton";
import {toast} from "react-toast";
import IndexPage from "./index";

export default function DiscoverPage() {
    const {data: session, status} = useSession()
    const {data, error, isLoading} = useSWR<IPost[]>(
        session?.user ? `/api/post/all` : null, fetcher
    )

    useEffect(() => {
        if (error) {
            toast.error(error.message)
        }
    }, [error])

    return (
        <>
            <h1 className="text-3xl font-bold text-center">
                Discover
            </h1>

            <p className="tracking-normal text-gray-500 md:text-sm dark:text-gray-400 text-center my-4">
                Take a look at what other people are grateful for! 🌎
            </p>

            <PostTileContainer>
                {isLoading && [1,2,3].map((key) => <PostTileSkeleton key={key}></PostTileSkeleton>)}

                {data && data.map((post, key) => <PostTile post={post} key={key}></PostTile>)}
                {data?.length === 0 && <>No posts!</>}
            </PostTileContainer>
        </>
    )
}

DiscoverPage.getLayout = function getLayout(page: React.ReactNode) {
  return <Layout>{page}</Layout>
}