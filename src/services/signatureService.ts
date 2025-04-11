
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

export async function signItr(itrId: string, userId: string, role: 'inspector' | 'approver'): Promise<Signature> {
  // First check if this user has already signed this ITR in this role
  const { data: existingSignature } = await supabase
    .from('signatures')
    .select('*')
    .eq('itr_id', itrId)
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle();

  if (existingSignature) {
    throw new Error(`This ITR has already been signed by this user as ${role}`);
  }

  // Add the signature
  const { data, error } = await supabase
    .from('signatures')
    .insert({
      itr_id: itrId,
      user_id: userId,
      role,
      signature_date: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Error signing ITR:", error);
    throw error;
  }

  // Log this activity
  await logDatabaseActivity(
    'SIGN_ITR',
    'signatures',
    data.id,
    { itr_id: itrId, user_id: userId, role }
  );

  // Check if this ITR now has both signatures
  const { count } = await supabase
    .from('signatures')
    .select('*', { count: 'exact' })
    .eq('itr_id', itrId);

  // If we have both signatures, update the ITR status to completed
  if (count === 2) {
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

  return data;
}

export async function getItrSignatures(itrId: string): Promise<Signature[]> {
  const { data, error } = await supabase
    .from('signatures')
    .select('*')
    .eq('itr_id', itrId)
    .order('created_at');

  if (error) {
    console.error("Error fetching ITR signatures:", error);
    throw error;
  }

  return data || [];
}

export async function revokeSignature(signatureId: string): Promise<boolean> {
  // Get the signature first to check the ITR status
  const { data: signature, error: fetchError } = await supabase
    .from('signatures')
    .select('itr_id')
    .eq('id', signatureId)
    .single();

  if (fetchError) {
    console.error("Error fetching signature:", fetchError);
    throw fetchError;
  }

  // Delete the signature
  const { error } = await supabase
    .from('signatures')
    .delete()
    .eq('id', signatureId);

  if (error) {
    console.error("Error revoking signature:", error);
    throw error;
  }

  // Update the ITR status back to in progress
  const { error: updateError } = await supabase
    .from('itrs')
    .update({
      status: 'inprogress',
      progress: 50
    })
    .eq('id', signature.itr_id);

  if (updateError) {
    console.error("Error updating ITR status after signature revocation:", updateError);
    throw updateError;
  }

  await logDatabaseActivity(
    'REVOKE_SIGNATURE',
    'signatures',
    signatureId,
    { itr_id: signature.itr_id }
  );

  return true;
}
