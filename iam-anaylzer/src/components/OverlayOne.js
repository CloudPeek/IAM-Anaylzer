import React from 'react';
import OverlayIAMUser from '@/components/Overlay/OverlayIAMUser';
import OverlayIAMRole from '@/components/Overlay/OverlayIAMRole';
//import OverlayIAMGroup from './OverlayIAMGroup';

const OverlayOne = ({ open, setOpen, entity }) => {
  if (!entity) {
    console.error('No entity data available.');
    return null;
  }

  switch (entity.type) {
    case 'user':
      return <OverlayIAMUser open={open} setOpen={setOpen} user={entity} />;
    case 'role':
      return <OverlayIAMRole open={open} setOpen={setOpen} role={entity} />;
    case 'group':
      return <OverlayIAMGroup open={open} setOpen={setOpen} group={entity} />;
    default:
      return <p className="text-sm text-black">Unknown entity type.</p>;
  }
};

export default OverlayOne;
