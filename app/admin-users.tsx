import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

export default function AdminUsersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/users');
      const data = response.data?.data || response.data?.users || response.data?.content || response.data || [];
      const userList = Array.isArray(data) ? data : [];
      setUsers(userList);
    } catch (err: any) {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get the correct user ID — username field contains the UUID
  const getUserId = (user: any) => {
    return user.username || user.userId || user.id || user.uuid;
  };

  // Enable or disable a user account
  const handleToggleUser = async (user: any) => {
    const action = user.active ? 'disable' : 'enable';
    const userId = getUserId(user);
    Alert.alert(
      `${action === 'disable' ? 'Disable' : 'Enable'} User`,
      `Are you sure you want to ${action} ${user.fullName || user.firstName || user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'disable' ? 'Disable' : 'Enable',
          style: action === 'disable' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              // Backend expects "enabled" field
              await api.put(`/admin/users/${userId}/status`, {
                enabled: !user.active,
              });
              // Update local state immediately
              setUsers(users.map(u =>
                getUserId(u) === userId
                  ? { ...u, active: !u.active }
                  : u
              ));
              Alert.alert('✅ Success', `User ${action}d successfully!`);
            } catch (err: any) {
              Alert.alert('Failed', err.response?.data?.error || err.response?.data?.message || `Could not ${action} user`);
            }
          },
        },
      ]
    );
  };

  // Delete a user account
  const handleDeleteUser = async (user: any) => {
    const userId = getUserId(user);
    Alert.alert(
      '⚠️ Delete User',
      `Are you sure you want to permanently delete ${user.fullName || user.firstName || user.email}? This cannot be undone!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/users/${userId}`);
              setUsers(users.filter(u => getUserId(u) !== userId));
              Alert.alert('✅ Success', 'User deleted successfully!');
            } catch (err: any) {
              Alert.alert('Failed', err.response?.data?.error || err.response?.data?.message || 'Could not delete user');
            }
          },
        },
      ]
    );
  };

  // Update user role
  const handleUpdateRole = async (user: any) => {
    const userId = getUserId(user);
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    Alert.alert(
      'Update Role',
      `Change ${user.fullName || user.email} role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await api.put(`/admin/users/${userId}/role`, { role: newRole });
              setUsers(users.map(u =>
                getUserId(u) === userId
                  ? { ...u, role: newRole }
                  : u
              ));
              Alert.alert('✅ Success', `User role updated to ${newRole}!`);
            } catch (err: any) {
              Alert.alert('Failed', err.response?.data?.error || 'Could not update role');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <TouchableOpacity onPress={fetchUsers} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {loading ? '--' : users.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: '#1D9E75' }]}>
            {loading ? '--' : users.filter(u => u.active !== false).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: '#E24B4A' }]}>
            {loading ? '--' : users.filter(u => u.active === false).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Disabled</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: '#534AB7' }]}>
            {loading ? '--' : users.filter(u => u.role === 'ADMIN').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Admins</Text>
        </View>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#534AB7" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Loading users...</Text>
        </View>
      )}

      {/* Error */}
      {error !== '' && !loading && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={22} color="#E24B4A" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* User list */}
      {!loading && users.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            All Users ({users.length})
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {users.map((user, index) => (
              <View
                key={getUserId(user) || index}
                style={[
                  styles.userRow,
                  index < users.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }
                ]}
              >
                {/* Avatar */}
                <View style={[styles.avatar, {
                  backgroundColor: user.role === 'ADMIN' ? '#534AB7' : '#1D9E75'
                }]}>
                  <Text style={styles.avatarText}>
                    {user.fullName ? user.fullName[0].toUpperCase()
                      : user.firstName ? user.firstName[0].toUpperCase()
                      : '?'}
                  </Text>
                </View>

                {/* User info */}
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown'}
                  </Text>
                  <Text style={[styles.userEmail, { color: colors.subtitle }]}>
                    {user.email}
                  </Text>
                  <View style={styles.badgeRow}>
                    {/* Role badge - tap to change role */}
                    <TouchableOpacity
                      onPress={() => handleUpdateRole(user)}
                      style={[styles.roleBadge, {
                        backgroundColor: user.role === 'ADMIN' ? '#534AB7' : '#1D9E75'
                      }]}
                    >
                      <Text style={styles.badgeText}>{user.role || 'USER'}</Text>
                    </TouchableOpacity>
                    {/* Status badge */}
                    <View style={[styles.statusBadge, {
                      backgroundColor: user.active === false ? '#FEE2E2' : '#d1fae5'
                    }]}>
                      <Text style={[styles.statusText, {
                        color: user.active === false ? '#E24B4A' : '#065f46'
                      }]}>
                        {user.active === false ? 'Disabled' : 'Active'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action buttons */}
                <View style={styles.actionButtons}>
                  {/* Enable/Disable button */}
                  <TouchableOpacity
                    style={[styles.actionButton, {
                      backgroundColor: user.active === false ? '#d1fae5' : '#FEE2E2'
                    }]}
                    onPress={() => handleToggleUser(user)}
                  >
                    <Ionicons
                      name={user.active === false ? 'checkmark-outline' : 'ban-outline'}
                      size={16}
                      color={user.active === false ? '#065f46' : '#E24B4A'}
                    />
                  </TouchableOpacity>

                  {/* Delete button */}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => handleDeleteUser(user)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#E24B4A" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Empty state */}
      {!loading && users.length === 0 && error === '' && (
        <View style={styles.centered}>
          <Ionicons name="people-outline" size={48} color="#ccc" />
          <Text style={[styles.emptyText, { color: colors.subtitle }]}>No users found</Text>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#534AB7',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#fff' },
  refreshButton: { padding: 4 },
  statsRow: { flexDirection: 'row', gap: 8, padding: 16 },
  statCard: {
    flex: 1, borderRadius: 12, padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statNumber: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 10, textAlign: 'center' },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    marginHorizontal: 16, marginBottom: 10,
  },
  card: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 32,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  userEmail: { fontSize: 12, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  statusText: { fontSize: 9, fontWeight: '700' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionButton: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 15 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14, margin: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: '#991b1b' },
});