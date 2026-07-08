import {
  useUser,
  useUpdateUser,
  useDeleteUser,
} from './custom-hooks-pattern'

export function UserDetail({ id }: { id: number }) {
  const { data: user, isPending } = useUser(id)
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser()
  const { mutate: deleteUser } = useDeleteUser()

  if (isPending) return <div>Loading...</div>
  if (!user) return <div>User not found</div>

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>

      <button
        type="button"
        onClick={() => updateUser({ id: user.id, name: 'Updated Name' })}
        disabled={isUpdating}
      >
        Update Name
      </button>

      <button type="button" onClick={() => deleteUser(user.id)}>
        Delete User
      </button>
    </div>
  )
}
