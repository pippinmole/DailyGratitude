import {Session, useSession} from "@supabase/auth-helpers-react";
import {User} from "@supabase/gotrue-js";
import {SupabaseClient} from "@supabase/supabase-js";
import {supabase} from "./supabaseClient";
import {Database} from "../models/schema";
import {IPostForm} from "../components/index/CreatePost";
import {useEffect, useState} from "react";
import {ProfileResponse} from "../models/types";

export async function getProfile(
  supabase: SupabaseClient<Database>,
  session: Session
) {
  return getProfileById(supabase, session.user.id)
}

export async function getProfileById(
  supabase: SupabaseClient<Database>,
  id: string | null
) {
  if(!id) {
    return null
  }

  return supabase
    .from("profiles")
    .select(`*`)
    .eq("id", id)
    .limit(1)
    .maybeSingle();
}

export async function getTodaysPost(
  supabase: SupabaseClient<Database>,
  session: Session
) {
  if(!session || !session.user) {
    return null
  }

  return supabase
    .from('posts')
    .select("*, author:author_id (*)")
    .eq('author_id', session.user.id)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(1)
    .maybeSingle()
}

export async function getAllPosts<T>(
  supabase: SupabaseClient<Database>
) {
  return supabase
    .from('posts')
    .select(`*, author:author_id (*)`)
}

export async function getAllPostsForSession(
  supabase: SupabaseClient<Database>,
  session: Session
) {
  return getAllPostsForUserId(supabase, session?.user.id);
}

export async function getAllPostsForUserId(
  supabase: SupabaseClient<Database>,
  id: string
) {
  return supabase
    .from('posts')
    .select(`*, author:author_id (*)`)
    .eq('author_id', id)
}

export async function createPost(
  supabase: SupabaseClient<Database>,
  session: Session,
  form: IPostForm,
  files: string[]
) {
  return supabase
    .from('posts')
    .insert({
      author_id: session.user.id,
      title: form.title,
      content: form.content,
      images: files
    })
    .select()
    .limit(1)
    .maybeSingle()
}

supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("auth event", event, session)

  if(!session?.user) return

  await createProfile(supabase, session?.user);
});

const createProfile = async (supabase: SupabaseClient<Database>, user: User) => {
  return supabase
    .from("profiles")
    .insert({
      id: user.id,
      username: usernameToEmail(user.email)
    })
    .single();
}

const usernameToEmail = (email: string | undefined) => {
  if(!email) return "UNKNOWN";

  return email.substring(0, email.indexOf("@"))
}

export const useProfile = (): ProfileResponse | null => {
  const session = useSession();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    if (!session) {
      setProfile(null)
    } else {
      getProfile(supabase, session)
        .then(setProfile)
    }
  }, [session])

  return profile
}

export type EditProfile = {
  username: string
  bio: string
}

export async function updateProfile(profile: ProfileResponse['data'], newProfile: EditProfile) {
  return supabase
    .from("profiles")
    .update({
      ...newProfile
    })
    .eq("id", profile?.id)
}