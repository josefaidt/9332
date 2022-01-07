import { useState, useEffect, useRef } from 'react'
import { API, Auth } from 'aws-amplify'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api'
import * as queries from '../graphql/queries'
import * as mutations from '../graphql/mutations'

async function createPost(input) {
  const result = await API.graphql({
    query: mutations.createPost,
    variables: { input },
    // authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
    authToken: (await Auth.currentSession()).getIdToken().getJwtToken(),
  })
  return result.data.createPost.id
}

async function listPosts() {
  const result = await API.graphql({
    query: queries.listPosts,
    // authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
    authToken: (await Auth.currentSession()).getIdToken().getJwtToken(),
  })
  return result.data.listPosts.items
}

export default function HomePage(props) {
  const [posts, setPosts] = useState([])
  const nameRef = useRef()
  const editorRef = useRef()

  async function list() {
    const posts = await listPosts()
    setPosts(posts)
  }

  async function handleOnSubmit(event) {
    event.preventDefault()
    const name = nameRef.current.value
    const editors = editorRef.current.value.length
      ? editorRef.current.value.split(',')
      : []
    const id = await createPost({
      name,
      editors,
    })
    await list()
  }

  useEffect(() => {
    list()
  }, [])

  return (
    <div>
      <h2>Posts</h2>
      <button onClick={list}>list</button>
      <form onSubmit={handleOnSubmit}>
        <label htmlFor="name">Name:</label>
        <input type="text" name="name" ref={nameRef} />
        <label htmlFor="editors">Editors (comma separated)</label>
        <input type="text" name="editors" ref={editorRef} />
        <input type="submit" value="Submit" />
      </form>
      <pre>
        <code>{JSON.stringify(posts, null, 2)}</code>
      </pre>
    </div>
  )
}
