'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  TextField,
  Button,
  MenuItem,
  Select,
  Pagination,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';

interface Project {
  _id: string;
  name: string;
  description: string;
  owner_email: string;
}

interface ServerResponse {
  projects: Project[];
  totalCount: number;
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  p: 4,
  borderRadius: 2,
};

const ITEMS_PER_PAGE = 5;

export default function ProjectTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [uniqueOwners, setUniqueOwners] = useState<string[]>([]);
  const router = useRouter();

  // Fetch projects with server-side filtering, pagination
  const fetchProjects = async () => {
  setLoading(true);
  setError(null);
  const token = localStorage.getItem('token');

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', ITEMS_PER_PAGE.toString());
  if (searchTerm) params.append('search', searchTerm);

  try {
    const res = await fetch(`http://localhost:5000/api/projects/?${params.toString()}`, {
      headers: { Authorization: token || '' },
    });
    if (!res.ok) throw new Error('Failed to fetch projects');
    const data: ServerResponse = await res.json();

    setProjects(data.projects);
    setTotalCount(data.totalCount);
  } catch (err: any) {
    setError(err.message);
    setProjects([]);
    setTotalCount(0);
  } finally {
    setLoading(false);
  }
};

  // Refetch projects on filters or page change
  useEffect(() => {
    fetchProjects();
  }, [searchTerm, emailFilter, page]);

  // Reset to page 1 if filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, emailFilter]);

  const handleOpenCreateModal = () => {
    setSelectedProject({ _id: '', name: '', description: '', owner_email: '' });
    setOpenCreateModal(true);
  };

  const handleOpenDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setOpenDeleteModal(true);
  };

  const handleCloseModals = () => {
    setSelectedProject(null);
    setOpenCreateModal(false);
    setOpenDeleteModal(false);
    setEditingProjectId(null);
  };

  const handleCreate = async () => {
    if (!selectedProject?.name || !selectedProject?.description) return;
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5000/api/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({
          name: selectedProject.name,
          description: selectedProject.description,
        }),
      });
      fetchProjects();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!selectedProject) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/projects/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({
          project_id: selectedProject._id,
          name: selectedProject.name,
          description: selectedProject.description,
        }),
      });

      if (!res.ok) throw new Error('Failed to update project');
      fetchProjects();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject?._id) return;
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5000/api/projects/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({ project_id: selectedProject._id }),
      });
      fetchProjects();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProjectId(project._id);
    setSelectedProject({ ...project });
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setSelectedProject(null);
  };

  return (
    <Box sx={{ padding: 4, marginTop: 8 }}>
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap',justifyContent: 'space-between', alignItems: 'center',width: '100%',mt: 5 }}>

        <TextField
          sx={{width: "80%"}}
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button variant="contained" onClick={handleOpenCreateModal}>
          + Create Project
        </Button>

      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ width: '100%', mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Owner</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No projects yet.
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                 <TableRow
                      key={project._id.toString()}
                      hover
                      onClick={() => {
                        if (!editingProjectId) {
                          router.push(`/task?projectId=${project._id}`);
                        }
                      }}
                      sx={{ cursor: 'pointer' }}
                  >

                    <TableCell>
                      {editingProjectId === project._id ? (
                        <TextField
                          value={selectedProject?.name || ''}
                          onChange={(e) =>
                            setSelectedProject((prev) => ({ ...prev!, name: e.target.value }))
                          }
                          size="small"
                        />
                      ) : (
                        project.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingProjectId === project._id ? (
                        <TextField
                          value={selectedProject?.description || ''}
                          onChange={(e) =>
                            setSelectedProject((prev) => ({
                              ...prev!,
                              description: e.target.value,
                            }))
                          }
                          size="small"
                        />
                      ) : (
                        project.description
                      )}
                    </TableCell>
                    <TableCell>{project.owner_email}</TableCell>
                    <TableCell>
                      {editingProjectId === project._id ? (
                        <>
                          <Button variant="contained" onClick={handleSave} sx={{ mr: 1 }}>
                            Save
                          </Button>
                          <Button variant="outlined" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={(e) => {e.stopPropagation(); handleEdit(project)}}
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleOpenDeleteModal(project)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

            </Table>
          </TableContainer>

          <Pagination
            count={Math.ceil(totalCount / ITEMS_PER_PAGE)}
            page={page}
            onChange={(_, value) => setPage(value)}
            sx={{ mt: 2 }}
          />
        </>
      )}

      {/* Create Modal */}
      <Modal open={openCreateModal} onClose={handleCloseModals}>
        <Box sx={style}>
          <Typography variant="h6" mb={2}>
            Create New Project
          </Typography>
          <TextField
            fullWidth
            label="Project Name"
            value={selectedProject?.name || ''}
            onChange={(e) =>
              setSelectedProject((prev) => ({ ...prev!, name: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={selectedProject?.description || ''}
            onChange={(e) =>
              setSelectedProject((prev) => ({ ...prev!, description: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </Box>
      </Modal>

      {/* Delete Modal */}
      <Modal open={openDeleteModal} onClose={handleCloseModals}>
        <Box sx={style}>
          <Typography variant="h6" mb={2}>
            Confirm Delete
          </Typography>
          <Typography mb={2}>
            Are you sure you want to delete project <strong>{selectedProject?.name}</strong>?
          </Typography>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Confirm Delete
          </Button>
          <Button variant="outlined" sx={{ ml: 2 }} onClick={handleCloseModals}>
            Cancel
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
