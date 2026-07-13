import React from 'react';
import { useParams } from 'react-router-dom';
import CommunityDetailView from '../../components/common/CommunityDetailView/CommunityDetailView';

const CommunityDetail = () => {
  const { slug } = useParams();
  return <CommunityDetailView slug={slug} />;
};

export default CommunityDetail;
