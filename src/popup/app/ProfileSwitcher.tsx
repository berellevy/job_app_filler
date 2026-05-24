import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { AddIcon, DeleteIcon, EditIcon, SaveIcon, ClearIcon } from '@src/shared/utils/icons'
import {
  createProfile,
  deleteProfile,
  loadProfilesIndex,
  Profile,
  ProfilesIndex,
  renameProfile,
  setActiveProfile,
  DEFAULT_PROFILE_ID,
} from '@src/contentScript/utils/storage/Profiles'

type EditMode = 'none' | 'create' | 'rename'

export const ProfileSwitcher = () => {
  const [index, setIndex] = useState<ProfilesIndex | null>(null)
  const [editMode, setEditMode] = useState<EditMode>('none')
  const [draftName, setDraftName] = useState<string>('')

  useEffect(() => {
    loadProfilesIndex().then(setIndex)
  }, [])

  if (!index) {
    return null
  }

  const activeProfile: Profile | undefined = index.profiles.find(
    (p) => p.id === index.activeProfileId
  )

  const handleSelect = async (event: SelectChangeEvent<string>): Promise<void> => {
    const next = await setActiveProfile(event.target.value)
    setIndex(next)
  }

  const beginCreate = (): void => {
    setEditMode('create')
    setDraftName('')
  }

  const beginRename = (): void => {
    setEditMode('rename')
    setDraftName(activeProfile?.name ?? '')
  }

  const cancelEdit = (): void => {
    setEditMode('none')
    setDraftName('')
  }

  const commitEdit = async (): Promise<void> => {
    const name = draftName.trim()
    if (!name) {
      return
    }
    const next =
      editMode === 'create'
        ? await createProfile(name)
        : await renameProfile(index.activeProfileId, name)
    setIndex(next)
    cancelEdit()
  }

  const handleDelete = async (): Promise<void> => {
    if (index.activeProfileId === DEFAULT_PROFILE_ID) {
      return
    }
    const next = await deleteProfile(index.activeProfileId)
    setIndex(next)
  }

  const isDefaultActive = index.activeProfileId === DEFAULT_PROFILE_ID

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Profile
      </Typography>
      {editMode === 'none' ? (
        <Stack direction={'row'} spacing={1} alignItems={'center'}>
          <FormControl size="small" sx={{ flexGrow: 1 }}>
            <InputLabel id="profile-select-label">Active profile</InputLabel>
            <Select
              labelId="profile-select-label"
              label="Active profile"
              value={index.activeProfileId}
              onChange={handleSelect}
            >
              {index.profiles.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="New profile">
            <IconButton size="small" onClick={beginCreate}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rename profile">
            <IconButton size="small" onClick={beginRename}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              isDefaultActive
                ? 'The Default profile cannot be deleted'
                : 'Delete profile'
            }
          >
            <span>
              <IconButton
                size="small"
                onClick={handleDelete}
                disabled={isDefaultActive}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ) : (
        <Stack direction={'row'} spacing={1} alignItems={'center'}>
          <TextField
            size="small"
            autoFocus
            fullWidth
            label={editMode === 'create' ? 'New profile name' : 'Rename profile'}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void commitEdit()
              }
              if (e.key === 'Escape') {
                cancelEdit()
              }
            }}
          />
          <Tooltip title="Save">
            <span>
              <IconButton
                size="small"
                onClick={() => void commitEdit()}
                disabled={!draftName.trim()}
              >
                <SaveIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Cancel">
            <IconButton size="small" onClick={cancelEdit}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
      <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
        Autofill uses the answers saved under the active profile.
      </Typography>
    </Box>
  )
}
