
import { supabase } from "@/integrations/supabase/client";
import { logDatabaseActivity } from "@/services/logService";

interface Signature {
  id: string;
  itr_id: string;
  user_id: string;
  signature_date: string;
  role: 'inspector' | 'approver';
  created_at: string;
}

// Since we don't have access to modify the database schema, we'll simulate the signatures functionality
// by using a temporary approach that doesn't rely on an actual signatures table.
// In a real implementation, you would create a signatures table in the database.

export async function signItr(itrId: string, userId: string, role: 'inspector' | 'approver'): Promise<Signature> {
  // First check if this ITR exists
  const { data: itr, error: itrError } = await supabase
    .from('itrs')
    .select('*')
    .eq('id', itrId)
    .single();

  if (itrError || !itr) {
    console.error("Error finding ITR:", itrError);
    throw new Error("ITR not found");
  }

  // Check if the user exists
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    console.error("Error finding user:", userError);
    throw new Error("User not found");
  }

  // For demo purposes, we'll store signature information in the ITR's metadata field
  // In a real implementation, you would have a separate signatures table
  let signatures = [];
  if (itr.metadata && typeof itr.metadata === 'object' && Array.isArray(itr.metadata.signatures)) {
    signatures = itr.metadata.signatures;
  }

  // Check if this user has already signed in this role
  const existingSignature = signatures.find(
    (sig: any) => sig.user_id === userId && sig.role === role
  );

  if (existingSignature) {
    throw new Error(`This ITR has already been signed by this user as ${role}`);
  }

  // Add the signature
  const newSignature = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    itr_id: itrId,
    user_id: userId,
    role,
    signature_date: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  signatures.push(newSignature);

  // Update the ITR with the new signature
  const { data, error } = await supabase
    .from('itrs')
    .update({
      metadata: {
        ...itr.metadata,
        signatures
      }
    })
    .eq('id', itrId)
    .select()
    .single();

  if (error) {
    console.error("Error signing ITR:", error);
    throw error;
  }

  // Log this activity
  await logDatabaseActivity(
    'SIGN_ITR',
    'itrs',
    itrId,
    { user_id: userId, role }
  );

  // If we have both inspector and approver signatures, update the ITR status to completed
  const hasInspector = signatures.some((sig: any) => sig.role === 'inspector');
  const hasApprover = signatures.some((sig: any) => sig.role === 'approver');

  if (hasInspector && hasApprover) {
    const { error: updateError } = await supabase
      .from('itrs')
      .update({
        status: 'complete',
        progress: 100
      })
      .eq('id', itrId);

    if (updateError) {
      console.error("Error updating ITR status after signatures:", updateError);
      throw updateError;
    }

    await logDatabaseActivity(
      'COMPLETE_ITR',
      'itrs',
      itrId,
      { reason: 'All signatures collected' }
    );
  }

  return newSignature as Signature;
}

export async function getItrSignatures(itrId: string): Promise<Signature[]> {
  // Get the ITR first
  const { data: itr, error } = await supabase
    .from('itrs')
    .select('*')
    .eq('id', itrId)
    .single();

  if (error) {
    console.error("Error fetching ITR signatures:", error);
    throw error;
  }

  if (!itr || !itr.metadata || !itr.metadata.signatures) {
    return [];
  }

  return itr.metadata.signatures as Signature[];
}

export async function revokeSignature(signatureId: string): Promise<boolean> {
  // Find the signature in all ITRs
  const { data: itrs, error: fetchError } = await supabase
    .from('itrs')
    .select('*')
    .filter('metadata', 'neq', null);

  if (fetchError) {
    console.error("Error fetching ITRs:", fetchError);
    throw fetchError;
  }

  let itrWithSignature = null;
  let signatures = [];

  // Find the ITR containing the signature
  for (const itr of itrs) {
    if (itr.metadata && itr.metadata.signatures) {
      const sigIndex = itr.metadata.signatures.findIndex((s: any) => s.id === signatureId);
      if (sigIndex >= 0) {
        itrWithSignature = itr;
        signatures = [...itr.metadata.signatures];
        signatures.splice(sigIndex, 1);
        break;
      }
    }
  }

  if (!itrWithSignature) {
    throw new Error("Signature not found");
  }

  // Update the ITR to remove the signature
  const { error } = await supabase
    .from('itrs')
    .update({
      metadata: {
        ...itrWithSignature.metadata,
        signatures
      },
      status: 'inprogress',
      progress: 50
    })
    .eq('id', itrWithSignature.id);

  if (error) {
    console.error("Error revoking signature:", error);
    throw error;
  }

  await logDatabaseActivity(
    'REVOKE_SIGNATURE',
    'itrs',
    itrWithSignature.id,
    { signature_id: signatureId }
  );

  return true;
}
