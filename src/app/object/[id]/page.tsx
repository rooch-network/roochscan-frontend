'use client';

import Object from 'src/app/[network]/object/[id]/page';

export default function Page({ params }: { params: { id: string } }) {
  return <Object params={params} />;
}
  