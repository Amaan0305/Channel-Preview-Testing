"use client";

import { useState, useEffect } from "react";
import AddPermalink from "../components/AddPermalink";
import SocialMediaFormComponent from "../components/SocialMediaFormComponent";
import EditChannelSetupComponent from "../components/EditChannelSetup";
import { getChannels } from "../utils/getChannel.js";
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  styled,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import Link from 'next/link';

// Styled components for consistent styling
const BackgroundContainer = styled('div')({
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const StyledContainer = styled(Container)({
  backgroundColor: "rgba(255, 255, 255, 0.8)", // Slightly transparent for background visibility
  borderRadius: "8px",
  padding: "20px",
  marginTop: "20px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
});

const HeaderTypography = styled(Typography)({
  fontWeight: "bold",
  color: "#333",
  textAlign: "center",
  marginBottom: "20px",
  flex: 1, // Added for proper centering of the title
});

const StyledAccordion = styled(Accordion)({
  backgroundColor: "#fff",
  marginBottom: "10px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  "&:before": {
    display: "none",
  },
});

const StyledAccordionSummary = styled(AccordionSummary)({
  backgroundColor: "#f0f0f0",
  borderRadius: "8px 8px 0 0",
  "& .MuiAccordionSummary-content": {
    alignItems: "center",
  },
});

const StyledAccordionDetails = styled(AccordionDetails)({
  backgroundColor: "#fafafa",
  borderRadius: "0 0 8px 8px",
});

const ContentBox = styled(Box)({
  padding: "10px 20px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
});

const HeaderContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: '20px', // Added for spacing between header and content
});

export default function Home() {
  const [channels, setChannels] = useState([]);
  const fetchChannels = async () => {
    try {
      const fetchedChannels = await getChannels();
      setChannels(fetchedChannels);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  // Fetch channels from server on component mount
  useEffect(() => {
    fetchChannels();
  }, []);

  return (
    <BackgroundContainer>
      <StyledContainer maxWidth="md">
        <ContentBox>
          <HeaderContainer>
            <Link href="/" passHref>
              <IconButton>
                <HomeIcon fontSize="large" />
              </IconButton>
            </Link>
            <HeaderTypography variant="h4" component="h1" gutterBottom>
              Channel Preview Testing
            </HeaderTypography>
          </HeaderContainer>

          {/* Add New Permalink section */}
          <StyledAccordion>
            <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Add New Permalink</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
              <AddPermalink channels={channels} />
            </StyledAccordionDetails>
          </StyledAccordion>

          {/* Add Social Media Channel section */}
          <StyledAccordion>
            <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Add Social Media Channel</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
              <SocialMediaFormComponent fetchChannels={fetchChannels} />
            </StyledAccordionDetails>
          </StyledAccordion>

          {/* Edit Channel Setup section */}
          <StyledAccordion>
            <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Edit Channel Setup</Typography>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
              <EditChannelSetupComponent channelNames={channels} fetchChannels={fetchChannels} />
            </StyledAccordionDetails>
          </StyledAccordion>

        </ContentBox>
      </StyledContainer>
    </BackgroundContainer>
  );
}
