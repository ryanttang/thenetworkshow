"use client";
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Accordion, 
  AccordionItem, 
  AccordionButton, 
  AccordionPanel, 
  AccordionIcon,
  VStack,
  HStack,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon
} from "@chakra-ui/react";
import { MdCheckCircle, MdWarning, MdInfo } from "react-icons/md";

export default function FAQPage() {
  const faqData = [
    {
      category: "Age & ID Requirements",
      questions: [
        {
          question: "What age do I need to be to attend cannabis events?",
          answer: "You must be 21 years or older to attend cannabis events. Valid government-issued photo ID is required for entry. This includes driver's license, passport, or state ID card."
        },
        {
          question: "What forms of ID are accepted?",
          answer: "We accept valid government-issued photo IDs including: Driver's License, State ID Card, Passport, Military ID, or Tribal ID. The ID must be current and not expired."
        },
        {
          question: "Can I use a digital ID or photo of my ID?",
          answer: "No, we require the physical government-issued ID card. Digital copies or photos are not accepted for compliance and security reasons."
        }
      ]
    },
    {
      category: "Cannabis Consumption & Limits",
      questions: [
        {
          question: "How much cannabis can I purchase at events?",
          answer: "California law allows adults 21+ to purchase up to 28.5 grams (1 ounce) of cannabis flower, 8 grams of concentrate, or 6 immature plants per day. Event vendors will enforce these limits."
        },
        {
          question: "Can I consume cannabis at the event venue?",
          answer: "Consumption policies vary by venue and event type. Some events allow on-site consumption in designated areas, while others are purchase-only. Check event details for specific consumption policies."
        },
        {
          question: "What about edibles and dosage?",
          answer: "Edibles are limited to 10mg THC per serving and 100mg per package. Start with a low dose (2.5-5mg) and wait at least 2 hours before consuming more. Never drive under the influence."
        }
      ]
    },
    {
      category: "Event Policies & Safety",
      questions: [
        {
          question: "What should I bring to cannabis events?",
          answer: "Bring valid ID and any medical documentation if applicable. Leave valuables at home and follow venue security guidelines."
        },
        {
          question: "Are there security measures at events?",
          answer: "Yes, all events have security personnel, ID verification, and may include bag checks. Weapons, outside food/drinks, and illegal substances are prohibited."
        },
        {
          question: "What if I feel uncomfortable or need help?",
          answer: "Look for event staff, security, or medical personnel. We have designated safe spaces and medical assistance available. Don't hesitate to ask for help if you feel overwhelmed."
        }
      ]
    },
    {
      category: "Medical vs Recreational",
      questions: [
        {
          question: "Do I need a medical card to attend events?",
          answer: "No, recreational events are open to adults 21+ with valid ID. However, having a medical card may provide access to medical-only events, tax benefits, and higher purchase limits."
        },
        {
          question: "What are the benefits of a medical card?",
          answer: "Medical patients can purchase up to 8 ounces of flower, access to medical-only products, tax exemptions, and priority access to certain events and products."
        },
        {
          question: "Can I use my out-of-state medical card?",
          answer: "California does not accept out-of-state medical cards. You'll need to obtain a California medical recommendation or attend as a recreational user (21+ with valid ID)."
        }
      ]
    },
    {
      category: "Transportation & Legal",
      questions: [
        {
          question: "Can I drive to and from cannabis events?",
          answer: "You can drive to events, but never drive under the influence of cannabis. Plan for alternative transportation (rideshare, designated driver, public transit) if you plan to consume."
        },
        {
          question: "How should I transport cannabis purchases?",
          answer: "Keep purchases in the trunk or sealed container, separate from the driver. Cannabis must be in child-resistant packaging and not accessible to the driver while operating the vehicle."
        },
        {
          question: "What are the legal limits for driving?",
          answer: "California has a zero-tolerance policy for drivers under 21. For adults 21+, any detectable amount of THC can result in DUI charges. When in doubt, don't drive."
        }
      ]
    },
    {
      category: "Event Types & Vendors",
      questions: [
        {
          question: "What types of cannabis events do you host?",
          answer: "We host educational seminars, product showcases, networking events, cultivation workshops, and social gatherings. All events comply with California cannabis regulations."
        },
        {
          question: "How do I know if vendors are licensed?",
          answer: "All vendors at our events are required to have valid California cannabis licenses. You can verify licenses on the California Cannabis Portal or ask vendors to show their license documentation."
        },
        {
          question: "Can I bring my own cannabis to events?",
          answer: "Outside cannabis is generally not permitted at events due to compliance and safety reasons. Purchase from licensed vendors at the event to ensure product safety and compliance."
        }
      ]
    }
  ];

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="2xl" mb={4} color="green.600">
            Cannabis Event FAQ
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
            Quick reference guide for cannabis event attendees in California. 
            Stay informed about compliance, safety, and best practices.
          </Text>
        </Box>

        {/* Important Notice */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>California Compliance Notice</AlertTitle>
            <AlertDescription>
              All information is based on current California cannabis laws and regulations. 
              Laws may change, so always verify current requirements before attending events.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Quick Reference */}
        <Box bg="gray.50" p={6} borderRadius="md">
          <Heading size="md" mb={4}>Quick Reference</Heading>
          <HStack spacing={4} flexWrap="wrap">
            <Badge colorScheme="green" p={2}>21+ with Valid ID</Badge>
            <Badge colorScheme="blue" p={2}>1 oz Flower Limit</Badge>
            <Badge colorScheme="purple" p={2}>No Driving Under Influence</Badge>
            <Badge colorScheme="orange" p={2}>Event Registration</Badge>
          </HStack>
        </Box>

        {/* FAQ Sections */}
        {faqData.map((section, sectionIndex) => (
          <Box key={sectionIndex}>
            <Heading size="lg" mb={4} color="green.700">
              {section.category}
            </Heading>
            <Accordion allowMultiple>
              {section.questions.map((item, itemIndex) => (
                <AccordionItem key={itemIndex} border="1px" borderColor="gray.200" borderRadius="md" mb={2}>
                  <AccordionButton _hover={{ bg: "gray.50" }} p={4}>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      {item.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} px={4}>
                    <Text color="gray.700" lineHeight="tall">
                      {item.answer}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
            {sectionIndex < faqData.length - 1 && <Divider my={6} />}
          </Box>
        ))}

        {/* Additional Resources */}
        <Box bg="green.50" p={6} borderRadius="md" border="1px" borderColor="green.200">
          <Heading size="md" mb={4} color="green.700">
            Additional Resources
          </Heading>
          <List spacing={2}>
            <ListItem>
              <ListIcon as={MdInfo} color="green.500" />
              <Text as="span" fontWeight="medium">California Cannabis Portal:</Text>{" "}
              <Text as="span" color="blue.600">cannabis.ca.gov</Text>
            </ListItem>
            <ListItem>
              <ListIcon as={MdCheckCircle} color="green.500" />
              <Text as="span" fontWeight="medium">Bureau of Cannabis Control:</Text>{" "}
              <Text as="span" color="blue.600">bcc.ca.gov</Text>
            </ListItem>
            <ListItem>
              <ListIcon as={MdWarning} color="orange.500" />
              <Text as="span" fontWeight="medium">Responsible Consumption:</Text>{" "}
              <Text as="span">Start low, go slow, and never drive under the influence</Text>
            </ListItem>
          </List>
        </Box>

        {/* Contact Information */}
        <Box textAlign="center" py={4}>
          <Text color="gray.600">
            Questions not answered here? Contact us at{" "}
            <Text as="span" color="blue.600" fontWeight="medium">
              info@thcmembersonlyclub.com
            </Text>
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}
